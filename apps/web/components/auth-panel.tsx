"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, LogOut, Mail, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { isEmail, isStrongPassword, passwordScore } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

function IconInput({
  icon,
  trailing,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted [&_svg]:size-4">{icon}</span>
      <Input {...props} className={cn("pl-9", trailing ? "pr-10" : undefined, className)} />
      {trailing && <span className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={onToggle}
      aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      {shown ? <EyeOff /> : <Eye />}
    </Button>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const color = score >= 4 ? "bg-success" : score >= 3 ? "bg-accent" : "bg-warning";
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < score ? color : "bg-surface-2")} />
        ))}
      </div>
      <span className="font-mono text-[11px] text-fg-muted">force {score}/5</span>
    </div>
  );
}

async function loginRequest(apiBase: string, email: string, password: string): Promise<string> {
  const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, apiBase, null);
  const tok = (res as any)?.access_token || (res as any)?.token || (res as any)?.accessToken;
  if (!tok) throw new Error("Jeton manquant dans la réponse");
  return tok;
}

export default function AuthPanel() {
  const { apiBase, setToken, setUser, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registerData, setRegisterData] = useState({ email: "", password: "", username: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPwLogin, setShowPwLogin] = useState(false);
  const [showPwRegister, setShowPwRegister] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [errors, setErrors] = useState<{ login?: string; register?: string } | null>(null);

  async function signIn(email: string, password: string, welcome: string) {
    const tok = await loginRequest(apiBase, email, password);
    setToken(tok);
    const me = await apiFetch("/auth/me", {}, apiBase, tok);
    setUser(me);
    toast({ title: welcome, description: `Bienvenue${me?.username ? ", " + me.username : ""} !` });
    router.push("/dashboard");
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    const { email, password, username } = registerData;
    if (!username.trim()) return setErrors({ register: "Le nom est requis." });
    if (!isEmail(email)) return setErrors({ register: "Email invalide." });
    if (!isStrongPassword(password))
      return setErrors({ register: "Mot de passe trop faible (8 caractères min., mélangez chiffres, majuscules et symboles)." });
    setLoadingRegister(true);
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(registerData) }, apiBase, null);
      await signIn(email, password, "Compte créé");
    } catch (err: any) {
      setErrors({ register: err?.message || "Échec de l'inscription." });
    } finally {
      setLoadingRegister(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    const { email, password } = loginData;
    if (!isEmail(email)) return setErrors({ login: "Email invalide." });
    if (!password) return setErrors({ login: "Mot de passe requis." });
    setLoadingLogin(true);
    try {
      await signIn(email, password, "Connecté");
    } catch (err: any) {
      setErrors({ login: err?.message || "Échec de la connexion." });
    } finally {
      setLoadingLogin(false);
    }
  }

  function doLogout() {
    setToken(null);
    setUser(null);
    toast({ title: "Déconnecté" });
  }

  if (user) {
    const name = user.username || user.email?.split("@")[0] || "Utilisateur";
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle font-mono font-semibold text-accent ring-1 ring-accent-border">
            {name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {user.email && <p className="truncate font-mono text-xs text-fg-muted">{user.email}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => router.push("/dashboard")}>
            Aller au dashboard
          </Button>
          <Button variant="outline" onClick={doLogout}>
            <LogOut /> Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  const score = passwordScore(registerData.password);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Se connecter</TabsTrigger>
        <TabsTrigger value="register">Créer un compte</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-lg">Connexion</h2>
            <p className="text-[13px] text-fg-muted">Entre tes identifiants pour accéder à ton espace.</p>
          </div>
          {errors?.login && <Notice tone="danger">{errors.login}</Notice>}
          <Field label="Email" htmlFor="login-email">
            <IconInput
              id="login-email"
              type="email"
              icon={<Mail />}
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mot de passe" htmlFor="login-password">
            <IconInput
              id="login-password"
              type={showPwLogin ? "text" : "password"}
              icon={<Lock />}
              trailing={<PasswordToggle shown={showPwLogin} onToggle={() => setShowPwLogin((s) => !s)} />}
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loadingLogin}>
            {loadingLogin && <Loader2 className="animate-spin" />} Se connecter
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <form onSubmit={handleRegister} noValidate className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-lg">Créer un compte</h2>
            <p className="text-[13px] text-fg-muted">Rejoins DevDocsHub et organise ta documentation.</p>
          </div>
          {errors?.register && <Notice tone="danger">{errors.register}</Notice>}
          <Field label="Nom" htmlFor="reg-name">
            <IconInput
              id="reg-name"
              icon={<UserIcon />}
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
          </Field>
          <Field label="Email" htmlFor="reg-email">
            <IconInput
              id="reg-email"
              type="email"
              icon={<Mail />}
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mot de passe" htmlFor="reg-password" hint={<StrengthMeter score={score} />}>
            <IconInput
              id="reg-password"
              type={showPwRegister ? "text" : "password"}
              icon={<Lock />}
              trailing={<PasswordToggle shown={showPwRegister} onToggle={() => setShowPwRegister((s) => !s)} />}
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loadingRegister}>
            {loadingRegister && <Loader2 className="animate-spin" />} Créer le compte
          </Button>
          <p className="text-center text-xs text-fg-muted">
            En t'inscrivant, tu acceptes les conditions d'utilisation et la politique de confidentialité.
          </p>
        </form>
      </TabsContent>
    </Tabs>
  );
}
