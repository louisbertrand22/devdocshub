import Link from "next/link";

export function Logo({ href = "/dashboard" }: { href?: "/" | "/dashboard" }) {
  return (
    <Link href={href} className="font-mono text-[15px] font-bold tracking-tight text-fg">
      devdocs<span className="text-accent">hub</span>
    </Link>
  );
}
