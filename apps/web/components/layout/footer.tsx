import Link from "next/link";

const LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/privacy", label: "Confidentialité" },
  { href: "/terms", label: "CGU" },
  { href: "/licenses", label: "Licences" },
] as const;

/** `year` vient du layout serveur : calculé côté client, il divergerait du HTML prérendu. */
export function Footer({ year }: { year: number }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 font-mono text-xs text-fg-muted md:px-8">
        <span>© {year} devdocshub</span>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-fg">
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/louisbertrand22/devdocshub"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-fg"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
