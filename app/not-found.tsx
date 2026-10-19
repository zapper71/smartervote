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
          <Link href="/" className="link">
            Find your municipality or district
          </Link>
        </li>
      </ul>
    </div>
  );
}
