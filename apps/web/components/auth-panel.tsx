"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Loader2, LogOut } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

export default function AuthPanel() {
  const { apiBase, token, setToken, setUser, user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [registerData, setRegisterData] = useState({ email: "", password: "", name: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [showPwLogin, setShowPwLogin] = useState(false);
  const [showPwRegister, setShowPwRegister] = useState(false);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const [errors, setErrors] = useState<{ login?: string; register?: string } | null>(null);

  const handleRegister = async () => {
    setErrors(null);
    const { email, password, name } = registerData;
    if (!name.trim()) return setErrors({ register: "Le nom est requis." });
    if (!isEmail(email)) return setErrors({ register: "Email invalide." });
    if (passwordScore(password) < 3)
      return setErrors({ register: "Mot de passe trop faible (min. 8 caractères, mélangez chiffres/majuscules/symboles)." });

    setLoadingRegister(true);
    try {
      await apiFetch(
        "/auth/register",
        { method: "POST", body: JSON.stringify(registerData) },
        apiBase,
        null
      );
      toast({ title: "Compte créé", description: "Vous pouvez maintenant vous connecter." });
      setActiveTab("login");
    } catch (e: any) {
      setErrors({ register: e?.message || "Échec de l'inscription." });
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleLogin = async () => {
    setErrors(null);
    const { email, password } = loginData;
    if (!isEmail(email)) return setErrors({ login: "Email invalide." });
    if (!password) return setErrors({ login: "Mot de passe requis." });

    setLoadingLogin(true);
    try {
      const res = await apiFetch(
        "/auth/login",
        { method: "POST", body: JSON.stringify(loginData) },
        apiBase,
        null
      );
      const tok = (res as any)?.access_token || (res as any)?.token || (res as any)?.accessToken;
      if (!tok) throw new Error("Jeton manquant dans la réponse");
      setToken(tok);
      const me = await apiFetch("/auth/me", {}, apiBase, tok);
      setUser(me);
      toast({ title: "Connecté", description: `Bienvenue${me?.name ? ", " + me.name : ""} !` });
      window.location.href = "/";
    } catch (e: any) {
      setErrors({ login: e?.message || "Échec de la connexion." });
    } finally {
      setLoadingLogin(false);
    }
  };

  const doLogout = () => {
    setToken(null);
    setUser(null);
    toast({ title: "Déconnecté" });
  };

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const me = await apiFetch("/auth/me", {}, apiBase, token);
        setUser(me);
      } catch (e) {
        // ignore
      }
    })();
  }, [token, apiBase, setUser]);

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      {user ? (
        <Card className="border-dashed shadow-lg">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Connecté
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Session active
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 pt-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              {user.name && <p className="text-base font-medium">{user.name}</p>}
            </div>
            <Button variant="outline" onClick={doLogout} className="shrink-0">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-lg border-2">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl">Bienvenue 👋</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Entrez vos identifiants pour accéder à votre compte
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errors?.login && (
                    <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errors.login}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="vous@exemple.com"
                        className="pl-9"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        id="login-password"
                        type={showPwLogin ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwLogin((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-muted"
                        aria-label={showPwLogin ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPwLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mot de passe oublié ?</span>
                    <a className="text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                      Réinitialiser
                    </a>
                  </div>

                  <Button className="w-full" onClick={handleLogin} disabled={loadingLogin}>
                    {loadingLogin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Se connecter
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="shadow-lg border-2">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl">Créer votre compte</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Rejoignez DevDocsHub et organisez vos documents
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errors?.register && (
                    <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errors.register}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nom</Label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        id="reg-name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Ada Lovelace"
                        className="pl-9"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="vous@exemple.com"
                        className="pl-9"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        id="reg-password"
                        type={showPwRegister ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Au moins 8 caractères"
                        className="pl-9 pr-9"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwRegister((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-muted"
                        aria-label={showPwRegister ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPwRegister ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    <div className="mt-1 flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cx(
                            "h-1 w-full rounded-full bg-muted",
                            i < passwordScore(registerData.password) && "bg-primary"
                          )}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground">
                        Force : {passwordScore(registerData.password)}/5
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleRegister} disabled={loadingRegister}>
                    {loadingRegister && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Créer le compte
                  </Button>

                  <Separator />
                  <p className="text-center text-xs text-muted-foreground">
                    En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
