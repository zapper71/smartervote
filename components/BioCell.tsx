import Link from "next/link";
import Clampable from "@/components/Clampable";

/**
 * One candidate's bio on the compare page, clamped like the issue cells.
 *
 * The neutral empty treatment matches PositionCell's missing-position
 * treatment: muted italic text that describes our records, not the
 * candidate — "No bio on record." never implies they chose not to write
 * one. The correction link rides along, same as an empty position cell.
 */
export default function BioCell({
  bio,
  correctionHref,
}: {
  bio: string | null;
  correctionHref: string;
}) {
  if (!bio || bio.trim() === "") {
    return (
      <p className="text-sm text-ink-faint">
        <span className="italic">No bio on record.</span>{" "}
        <Link href={correctionHref} className="link">
          Know something?
        </Link>
      </p>
    );
  }
  return (
    <Clampable>
      <p className="text-sm leading-relaxed text-ink">{bio}</p>
    </Clampable>
  );
}
