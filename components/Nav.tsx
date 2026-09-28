import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/races", label: "Races" },
  { href: "/methodology", label: "How this works" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <header className="border-b border-paper-edge bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <Link href="/" className="tap-target font-semibold tracking-tight text-ink no-underline">
          <span className="text-lg">Smarter</span>
          <span className="text-lg text-accent">Vote</span>
          <span className="ml-2 hidden text-xs font-normal text-ink-faint sm:inline">
            Huntsville 2026
          </span>
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="tap-target rounded px-3 py-2 text-ink-soft no-underline hover:bg-accent-light hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
                </ul>
        <a
          href="https://gofund.me/9b32a40d4"
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target rounded-md bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:bg-accent-hover"
        >
          Donate
        </a>
      </nav>
    </header>
  );
}
