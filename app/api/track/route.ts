import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * POST /api/track — anonymous page-view counter.
 *
 * Body: { "path": "/races/mayor/compare" }
 *
 * Accepts ONLY a path string. Anything else in the body is ignored, so a
 * client can never smuggle an identifier, IP, or user agent into the table —
 * the server never reads headers for this route either. The increment
 * happens inside the increment_page_view() SQL function, which is the only
 * writer; the table has no public write policy.
 *
 * Always returns 200, even on failure: analytics must never break pages or
 * leak whether the database write succeeded.
 */

const MAX_PATH_LENGTH = 200;

function parseSlugs(path: string): { race: string | null; candidate: string | null } {
  // /races/{race}/compare and /races/{race}/{candidate}
  const m = path.match(/^\/races\/([^/]+)\/(?:compare|([^/]+))\/?$/);
  if (!m) return { race: null, candidate: null };
  return {
    race: m[1],
    candidate: m[2] && m[2] !== "compare" ? m[2] : null,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const path =
      typeof body === "object" && body !== null && typeof (body as { path?: unknown }).path === "string"
        ? ((body as { path: string }).path as string)
        : null;

    if (!path || !path.startsWith("/") || path.length > MAX_PATH_LENGTH) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    // Never track the admin area: internal use, not voter traffic.
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { race, candidate } = parseSlugs(path);
    const supabase = getServiceClient();
    const { error } = await supabase.rpc("increment_page_view", {
      p_path: path,
      p_race_slug: race,
      p_candidate_slug: candidate,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
