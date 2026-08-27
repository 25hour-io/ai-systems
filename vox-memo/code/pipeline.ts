import type { SupabaseClient } from "@supabase/supabase-js";
import { enrichMemo, CLEANING_MAX_CHARS } from "./enrich";
import { generateEmbedding } from "./embed";
import { crawlUrl, summarizeCrawledContent } from "./crawl";
import { analyzeImage } from "./analyze-image";
import { normalizeToUtc } from "@/lib/utils";

export async function processMemo(
  memoId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: memo, error } = await supabase
    .from("memos")
    .select("*, memo_attachments(*)")
    .eq("id", memoId)
    .single();

  if (error || !memo) {
    console.error("Pipeline: memo not found", memoId, error?.message);
    return;
  }

  let content = memo.content_text;

  // Analyze image attachments with Claude Vision
  const imageAttachments = (memo.memo_attachments ?? []).filter(
    (a: { file_type: string }) => a.file_type === "image"
  );
  if (imageAttachments.length > 0) {
    try {
      const descriptions: string[] = [];
      for (const att of imageAttachments) {
        try {
          const { data: signedData } = await supabase.storage
            .from("memo-attachments")
            .createSignedUrl(att.storage_path, 600);
          if (signedData?.signedUrl) {
            const desc = await analyzeImage(signedData.signedUrl);
            if (desc) descriptions.push(desc);
          }
        } catch (err) {
          console.error("Pipeline: image analysis failed for", att.storage_path, err);
        }
      }
      if (descriptions.length > 0) {
        const imageContent = descriptions.join("\n\n");
        const attachmentNames = (memo.memo_attachments ?? []).map(
          (a: { storage_path: string }) => a.storage_path.split("/").pop()
        );
        const isOnlyFilename = !content || attachmentNames.includes(content) || /^[\w\-. ]+\.\w{2,5}$/i.test(content.trim());
        if (isOnlyFilename) {
          content = imageContent;
        } else {
          content = `${content}\n\n${imageContent}`;
        }
        await supabase.from("memos").update({ content_text: content }).eq("id", memoId);
      }
    } catch (err) {
      console.error("Pipeline: image analysis step failed", err);
    }
  }

  if (!content || content === "Transcription en cours...") {
    return;
  }

  // Auto-crawl URLs found in content
  try {
    const urlMatches = content.match(/(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi);
    if (urlMatches) {
      const uniqueUrls = Array.from(new Set<string>(urlMatches));
      const urlsToCrawl = uniqueUrls.filter((url) => !content!.includes(`🔗 ${url}`));

      if (urlsToCrawl.length > 0) {
        const isLinkOnlyMemo = urlsToCrawl.length === 1
          && content.trim().replace(urlsToCrawl[0], "").trim() === "";

        const crawledSummaries: { url: string; summary: string }[] = [];

        for (const url of urlsToCrawl) {
          try {
            const crawled = await crawlUrl(url);
            const summary = await summarizeCrawledContent(crawled, url);
            crawledSummaries.push({ url, summary });
          } catch (err) {
            console.error("Pipeline: crawl failed for", url, err);
          }
        }

        if (isLinkOnlyMemo && crawledSummaries.length > 0) {
          content = `${crawledSummaries[0].summary}\n\nSource: ${crawledSummaries[0].url}`;
        } else if (crawledSummaries.length > 0) {
          let appendText = "";
          for (const { url, summary } of crawledSummaries) {
            appendText += `\n\n---\n🔗 ${url}\n${summary}`;
          }
          content = content + appendText;
        }

        if (crawledSummaries.length > 0) {
          await supabase.from("memos").update({ content_text: content }).eq("id", memoId);
        }
      }
    }
  } catch (err) {
    console.error("Pipeline: URL crawl failed", err);
  }

  // Tags produced by this run. `memo` was loaded before enrichment, so `memo.tags` still holds
  // the pre-enrichment value and must not feed the embedding below.
  let currentTags: string[] = (memo.tags as string[] | null) ?? [];
  let enrichmentOk = false;
  let embeddingOk = false;

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-US", { timeZone: "Asia/Jerusalem", hour12: false, hour: "2-digit", minute: "2-digit" });
    const timezone = "Asia/Jerusalem";
    const enrichment = await enrichMemo(content, { today, currentTime, timezone });

    const currentTitle = memo.title as string | null;
    let newTitle = enrichment.title;
    // UI strings are French: that is the application's interface language.
    if (currentTitle === "À lire" && newTitle) {
      newTitle = `À lire : ${newTitle}`;
    }

    const updatePayload: Record<string, unknown> = {
      title: newTitle || currentTitle,
      summary: enrichment.summary,
      tags: enrichment.tags,
      entities: enrichment.entities,
    };

    if (enrichment.cleaned_text !== null) {
      content = enrichment.cleaned_text;
      updatePayload.content_text = enrichment.cleaned_text;
    } else if (
      (enrichment.reminder_at || enrichment.priority) &&
      content.length <= CLEANING_MAX_CHARS
    ) {
      // Above that size the text is deliberately kept verbatim, so an uncleaned
      // body is the expected outcome rather than a missed cleaning. Warning on it
      // anyway would train the log to be ignored.
      console.warn("Pipeline: AI returned reminder_at/priority but cleaned_text is null — text not cleaned", memoId);
    }

    if (enrichment.reminder_at) {
      try {
        updatePayload.reminder_at = normalizeToUtc(enrichment.reminder_at, timezone);
        updatePayload.reminder_sent = false;
      } catch (err) {
        console.error("Pipeline: invalid reminder datetime from AI", enrichment.reminder_at, err);
      }
    }

    if (enrichment.priority && ["flash", "normal", "important"].includes(enrichment.priority)) {
      updatePayload.priority = enrichment.priority;
    }

    // supabase-js resolves with { error } instead of throwing: an update refused by the
    // database would otherwise slip past the catch below and count as a success.
    const { error: enrichWriteError } = await supabase
      .from("memos")
      .update(updatePayload)
      .eq("id", memoId);

    if (enrichWriteError) throw enrichWriteError;

    if (Array.isArray(enrichment.tags)) currentTags = enrichment.tags;
    enrichmentOk = true;
  } catch (err) {
    console.error("Pipeline: enrichment failed", err);
  }

  try {
    const embeddingText = [content, ...currentTags]
      .filter(Boolean)
      .join(" ");

    const embedding = await generateEmbedding(embeddingText);

    const { error: embeddingWriteError } = await supabase
      .from("memos")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", memoId);

    if (embeddingWriteError) throw embeddingWriteError;

    embeddingOk = true;
  } catch (err) {
    console.error("Pipeline: embedding failed", err);
  }

  try {
    const { data: related } = await supabase.rpc("find_related_memos", {
      p_memo_id: memoId,
      match_count: 5,
      p_user_id: memo.user_id,
    });

    if (related && related.length > 0) {
      const links = related
        .filter((r: { similarity: number }) => r.similarity > 0.75)
        .map((r: { id: string; similarity: number }) => ({
          memo_id: memoId,
          linked_memo_id: r.id,
          similarity: r.similarity,
          link_type: "similar",
        }));

      if (links.length > 0) {
        await supabase.from("memo_links").upsert(links, {
          onConflict: "memo_id,linked_memo_id",
        });
      }
    }
  } catch (err) {
    console.error("Pipeline: linking failed", err);
  }

  // Only claim the memo is processed when the steps a reader depends on actually succeeded.
  // Enrichment carries the title, tags and summary; the embedding carries semantic search.
  // Crawling and linking are best-effort: a memo without them is still usable and complete.
  //
  // Marking a half-processed memo as done is how it becomes invisible to any future retry —
  // it silently stops being a candidate for reprocessing, and nothing ever fixes it.
  if (enrichmentOk && embeddingOk) {
    await supabase
      .from("memos")
      .update({ ai_processed: true })
      .eq("id", memoId);
  } else {
    console.error(
      "Pipeline: leaving ai_processed false for reprocessing",
      memoId,
      { enrichmentOk, embeddingOk },
    );
  }
}
