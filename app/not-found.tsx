import Link from "next/link";

export default function NotFound() {
  return (
    <div className="prose-civic">
      <h1 className="text-3xl text-ink">Page not found</h1>
      <p className="mt-4">
        That page doesn&rsquo;t exist. It may have been a mistyped address, or something
        that moved.
      </p>
      <ul className="mt-4">
        <li>
          <Link href="/races" className="link">
            See all races on the Huntsville ballot
          </Link>
        </li>
        <li>
          <Link href="/" className="link">
            Back to the home page
          </Link>
        </li>
        <li>
          <a
            href="https://www.huntsville.ca/council-administration/municipal-and-school-board-elections/"
            className="link"
            rel="noopener noreferrer"
            target="_blank"
          >
            Official Town of Huntsville election page
          </a>
        </li>
      </ul>
    </div>
  );
}
