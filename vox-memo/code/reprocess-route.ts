import { getAdminClient } from "@/lib/supabase/admin";
import { processMemo } from "@/lib/ai/pipeline";
import { after, NextResponse } from "next/server";

// The server-side safety net: picks up memos whose AI pipeline never completed.
// Since `ai_processed` is no longer written when enrichment or embedding failed
// (see pipeline.ts), the flag stays `false` — but that is only worth anything if
// something reads it back. This is that something. Without this cron a failed
// memo is no longer silently lost, it is merely stuck forever.
//
// The fire-and-forget trigger on creation remains the fast path; this cron only
// picks up what has been sitting for longer than STALE_MS.

const STALE_MS = 10 * 60 * 1000; // 10 min: leaves the creation trigger time to finish
const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 5;
const TRANSCRIBING = "Transcription en cours...";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const staleBefore = new Date(Date.now() - STALE_MS).toISOString();

  // Voice memos still awaiting transcription are excluded: `processMemo` returns
  // immediately on that placeholder, and /api/cron/transcriptions owns them.
  // Including them here would burn their attempts for nothing.
  const { data: memos, error } = await supabase
    .from("memos")
    .select("id, ai_attempts")
    .eq("ai_processed", false)
    .is("deleted_at", null)
    .lt("created_at", staleBefore)
    .lt("ai_attempts", MAX_ATTEMPTS)
    // The lock: a memo picked up less than STALE_MS ago is out of scope. The
    // counter alone is not enough — while it stays under MAX_ATTEMPTS, a
    // concurrent cycle (or a memo whose pipeline outlives the cron interval)
    // would be selected again and would start a second pipeline over the first.
    .or(`ai_last_attempt_at.is.null,ai_last_attempt_at.lt.${staleBefore}`)
    .not("content_text", "is", null)
    .neq("content_text", "")
    .neq("content_text", TRANSCRIBING)
    .order("created_at", { ascending: false })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("Failed to fetch unprocessed memos:", error);
    return NextResponse.json({ error: "Failed to fetch memos" }, { status: 500 });
  }

  if (!memos || memos.length === 0) {
    return NextResponse.json({ picked: 0 });
  }

  // The batch is claimed BEFORE handing control back, on two axes.
  // `ai_last_attempt_at` keeps the memo out of the next cycle for STALE_MS —
  // that is mutual exclusion. `ai_attempts` guarantees a definitive stop even if
  // the pipeline crashes, loops, or exits through an early `return` (empty
  // content, placeholder). A memo that can never succeed costs five passes, not
  // an unbounded API bill.
  const claimedAt = new Date().toISOString();
  for (const memo of memos) {
    await supabase
      .from("memos")
      .update({
        ai_attempts: (memo.ai_attempts ?? 0) + 1,
        ai_last_attempt_at: claimedAt,
      })
      .eq("id", memo.id);
  }

  // The work goes through `after()` rather than before the response, because the
  // caller is a Postgres function whose net.http_get cuts off at 30s. A route
  // that works first gets killed mid-pipeline on every cycle — measured, it
  // burned attempt counters without ever finishing a single memo. So the route
  // answers immediately and Vercel keeps the function alive for the `after`.
  after(async () => {
    for (const memo of memos) {
      try {
        await processMemo(memo.id, supabase);
      } catch (err) {
        console.error(`Reprocess failed for memo ${memo.id}:`, err);
      }
    }
  });

  // The response reports what was picked up, never what succeeded — the verdict
  // is read from the database, not from this payload.
  return NextResponse.json({
    picked: memos.length,
    ids: memos.map((m) => m.id),
  });
}
