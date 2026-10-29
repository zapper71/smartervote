import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * POST /api/track-click — anonymous outbound-link click counter.
 *
 * Body: { "destination_type": "website" }
 *
 * Accepts ONLY a destination type from the fixed allowlist below.
 * Anything else in the body is ignored, so a client can never smuggle
 * an identifier, IP, or user agent into the table — the server never
 * reads headers for this route either. The increment happens inside
 * the increment_link_click() SQL function, which is the only writer;
 * the table has no public write policy. Counts are aggregate across
 * all candidates: no path, race, or candidate is ever sent or stored
 * (see supabase/45_link_click_counter.sql).
 *
 * Always returns 200, even on failure: analytics must never break
 * pages or leak whether the database write succeeded.
 */

const ALLOWED_DESTINATION_TYPES = new Set([
  "source",
  "website",
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "tiktok",
  "email",
  "other",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const destinationType =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { destination_type?: unknown }).destination_type ===
        "string"
        ? ((body as { destination_type: string }).destination_type as string)
        : null;

    if (!destinationType || !ALLOWED_DESTINATION_TYPES.has(destinationType)) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.rpc("increment_link_click", {
      p_destination_type: destinationType,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
