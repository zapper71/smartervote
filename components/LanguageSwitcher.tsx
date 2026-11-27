"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Language } from "@/lib/types";
import { LOCALE_COOKIE, localizePath, type Locale } from "@/lib/i18n";

/**
 * Language switcher (Andreas's spec): a drop-down with the British flag
 * for English and the Quebec flag for French, with 'EN' / 'FR' to the
 * right of the flag. Choosing a language sets the sv-locale cookie and
 * navigates to the same page in that locale. Renders nothing when fewer
 * than two languages are enabled, so pre-migration deploys degrade
 * cleanly.
 */
/**
 * Flag image path. The languages table stores the asset WITH its
 * directory ('flags/union-jack.svg') while the component used to
 * prepend '/flags/' itself — producing '/flags/flags/union-jack.svg',
 * a 404 and a broken-image icon in the switcher. Strip a leading
 * 'flags/' before prefixing so both shapes resolve.
 */
function flagSrc(asset: string): string {
  return `/flags/${asset.replace(/^flags\//, "")}`;
}

export default function LanguageSwitcher({
  languages,
}: {
  languages: Language[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  if (languages.length < 2) return null;

  const current: Locale =
    pathname === "/fr" || pathname.startsWith("/fr/") ? "fr" : "en";
  const currentLang =
    languages.find((l) => l.code === current) ?? languages[0];

  const choose = (code: string) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000`;
    setOpen(false);
    router.push(localizePath(pathname, code as Locale));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="tap-target flex items-center gap-2 rounded px-3 py-2 text-sm text-ink-soft no-underline hover:bg-accent-light hover:text-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagSrc(currentLang.flag_asset)}
          alt=""
          width={20}
          height={14}
          className="rounded-[2px]"
        />
        {currentLang.code.toUpperCase()}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[7rem] rounded-md border border-paper-edge bg-paper py-1 shadow-lg"
        >
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === current}
                onClick={() => choose(l.code)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-soft hover:bg-accent-light hover:text-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagSrc(l.flag_asset)}
                  alt=""
                  width={20}
                  height={14}
                  className="rounded-[2px]"
                />
                {l.code.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
