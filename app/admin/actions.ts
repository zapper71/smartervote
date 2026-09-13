"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { passwordMatches, requireAdmin, signIn, signOut } from "@/lib/admin-auth";

const REVIEWER = "Andreas";

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
