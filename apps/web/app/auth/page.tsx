import { Suspense } from "react";
import AuthPanel from "@/components/auth-panel";
import { Logo } from "@/components/layout/logo";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo href="/" />
          <p className="text-[13px] text-fg-muted">Tes docs, notes et collections techniques, au même endroit.</p>
        </div>
        <Suspense fallback={null}>
          <AuthPanel />
        </Suspense>
        <p className="text-center font-mono text-[11px] text-fg-muted">Première visite ? Crée un compte, c'est gratuit.</p>
      </div>
    </div>
  );
}
