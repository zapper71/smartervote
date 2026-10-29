/**
 * A candidate's email address, displayed below their name.
 *
 * The address comes from the certified candidate list (candidates.email,
 * present since 01_schema) — it is public election information, and it
 * renders as a mailto link so voters can contact the candidate.
 * Renders nothing when no email is on file.
 */
import TrackedOutboundLink from "@/components/TrackedOutboundLink";

export default function CandidateEmail({
  email,
  className = "mt-1 text-sm",
}: {
  email?: string | null;
  className?: string;
}) {
  if (!email) return null;
  return (
    <p className={className}>
      <TrackedOutboundLink
        className="link break-all"
        href={`mailto:${email}`}
        destination="email"
      >
        {email}
      </TrackedOutboundLink>
    </p>
  );
}
