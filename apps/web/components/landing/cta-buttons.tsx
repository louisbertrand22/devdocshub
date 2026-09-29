import Link from "next/link";
import type { Route } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** « Créer un compte gratuit » + « Se connecter », partagés par le hero et l'appel final. */
export function CtaButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Link href={"/auth?mode=register" as Route} className={cn(buttonVariants(), "h-10 px-5")}>
        Créer un compte gratuit
      </Link>
      <Link href="/auth" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
        Se connecter
      </Link>
    </div>
  );
}
