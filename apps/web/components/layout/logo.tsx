import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="font-mono text-[15px] font-bold tracking-tight text-fg">
      devdocs<span className="text-accent">hub</span>
    </Link>
  );
}
