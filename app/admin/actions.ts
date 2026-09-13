"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { passwordMatches, requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import { allowedExtents, type SourceExtent, type SourceType } from "@/lib/types";

const REVIEWER = "Andreas";

/**
 * Validate a source_extent against the row it is going on.
 *
 * Re-checked here rather than trusted from the form, because a dropdown is a
 * suggestion and a POST body is whatever someone sends. The rule being
 * enforced is the one that keeps this feature fair: a position reported by a
 * journalist can never be labelled with a length, since the length was the
 * journalist's choice, not the candidate's.
 *
 * Returns the value to store, or throws with a message worth reading.
 */
async function validatedExtent(
  db: ReturnType<typeof getServiceClient>,
  positionId: string,
  raw: FormDataEntryValue | null
): Promise<SourceExtent | null> {
  const value = String(raw ?? "").trim();
  if (value === "") return null; // "Not recorded" is always allowed.

  const { data, error } = await db
    .from("positions")
    .select("source_type")
    .eq("id", positionId)
    .single();
  if (error) throw new Error(`Could not read the position: ${error.message}`);

  const permitted = allowedExtents(data?.source_type as SourceType | null);
  if (!permitted.includes(value as SourceExtent)) {
    throw new Error(
      `"${value}" can't be used on a position sourced from ${data?.source_type ?? "an unknown source"}. ` +
        `Allowed here: ${permitted.join(", ")}.`
    );
  }
  return value as SourceExtent;
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    redirect("/admin?error=1");
  }
  await signIn();
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin");
}

/**
 * Publish a position.
 *
 * The database constraint `published_needs_source` will reject this if the
 * row somehow lacks a quote and source — that check is deliberately NOT
 * duplicated here. One rule, enforced in one place, that cannot be bypassed
 * by a future code path that forgets about it.
 */
export async function approveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const edited = formData.get("summary_short");

  const db = getServiceClient();
  const patch: Record<string, unknown> = {
    status: "published",
    reviewed_by: REVIEWER,
    reviewed_at: new Date().toISOString(),
  };
  // Edit-and-approve: if the textarea was changed, save the edit too.
  if (typeof edited === "string" && edited.trim().length > 0) {
    patch.summary_short = edited.trim();
  }

  // How much the candidate published on this issue. Only set when the form
  // sent the field at all, so an older form can't silently blank it.
  if (formData.has("source_extent")) {
    patch.source_extent = await validatedExtent(db, id, formData.get("source_extent"));
  }

  const { error } = await db.from("positions").update(patch).eq("id", id);
  if (error) throw new Error(`Could not publish: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

export async function rejectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({
      status: "draft",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not reject: ${error.message}`);

  revalidatePath("/admin");
}

/**
 * Set or change source_extent on a position that is already published.
 *
 * Exists so the second pass over the 47 already-live positions can be done
 * in the review screen instead of by hand-writing UPDATE statements. Nothing
 * else about the row changes, and it does not touch reviewed_at — recording
 * how long a source was is not a re-review of its content.
 */
export async function setExtentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const extent = await validatedExtent(db, id, formData.get("source_extent"));

  const { error } = await db
    .from("positions")
    .update({ source_extent: extent })
    .eq("id", id);
  if (error) throw new Error(`Could not save: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/** Pull a published position back off the site. */
export async function unpublishAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({ status: "in_review" })
    .eq("id", id);
  if (error) throw new Error(`Could not unpublish: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/**
 * Approve everything currently in review for one candidate.
 *
 * Scoped to a single candidate on purpose. A global "approve all" button is
 * exactly the thing you click at 11pm without reading, and the whole premise
 * of this site is that a person read every line.
 */
export async function bulkApproveCandidateAction(formData: FormData) {
  await requireAdmin();
  const candidateId = String(formData.get("candidate_id"));

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({
      status: "published",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId)
    .eq("status", "in_review");
  if (error) throw new Error(`Could not bulk approve: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/**
 * Record what you decided about a correction.
 *
 * Deliberately does NOT send an email. A site that auto-replies to candidates
 * during an election is one bad template away from an embarrassment, and the
 * reply is exactly the part that deserves a human. This records the decision
 * so nothing gets lost; you send the actual message yourself.
 */
export async function resolveCorrectionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const note = String(formData.get("resolution_note") ?? "").trim();

  if (!["accepted", "rejected", "needs_info"].includes(status)) {
    throw new Error(`Unexpected status: ${status}`);
  }

  const db = getServiceClient();
  const { error } = await db
    .from("corrections")
    .update({
      status,
      resolution_note: note || null,
      resolved_at: status === "needs_info" ? null : new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not update correction: ${error.message}`);

  revalidatePath("/admin/corrections");
}
