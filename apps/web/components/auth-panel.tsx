"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import styles from "./auth-panel.module.css";

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
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [registerData, setRegisterData] = useState({ email: "", password: "", username: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [showPwLogin, setShowPwLogin] = useState(false);
  const [showPwRegister, setShowPwRegister] = useState(false);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const [errors, setErrors] = useState<{ login?: string; register?: string } | null>(null);

  const handleRegister = async () => {
    setErrors(null);
    const { email, password, username } = registerData;
    if (!username.trim()) return setErrors({ register: "Le nom est requis." });
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
      toast({ title: "Compte créé", description: "Connexion automatique en cours..." });
      
      // Automatically log in after successful registration
      const res = await apiFetch(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
        apiBase,
        null
      );
      const tok = (res as any)?.access_token || (res as any)?.token || (res as any)?.accessToken;
      if (!tok) throw new Error("Jeton manquant dans la réponse");
      setToken(tok);
      const me = await apiFetch("/auth/me", {}, apiBase, tok);
      setUser(me);
      toast({ title: "Bienvenue !", description: `Compte créé avec succès${me?.username ? ", " + me.username : ""} !` });
      router.push("/dashboard");
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
      toast({ title: "Connecté", description: `Bienvenue${me?.username ? ", " + me.username : ""} !` });
      router.push("/dashboard");
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
    <div className={styles.authPanelContainer}>
      {user ? (
        <Card className={styles.connectedCard}>
          <CardHeader className={styles.connectedHeader}>
            <CardTitle className={styles.connectedTitle}>
              <div className={styles.userIconWrapper}>
                <UserIcon className={styles.userIcon} />
              </div>
              Connecté
            </CardTitle>
            <Badge variant="secondary" className={styles.sessionBadge}>
              Session active
            </Badge>
          </CardHeader>
          <CardContent className={styles.connectedContent}>
            <div className={styles.userInfo}>
              <p className={styles.userEmail}>{user.email}</p>
              {user.username && <p className={styles.userName}>{user.username}</p>}
            </div>
            <Button variant="outline" onClick={doLogout} className={styles.logoutButton}>
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={styles.motionContainer}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className={styles.authTabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className={styles.authCard}>
                <CardHeader className={styles.cardHeader}>
                  <CardTitle className={styles.cardTitle}>Bienvenue 👋</CardTitle>
                  <p className={styles.cardDescription}>
                    Entrez vos identifiants pour accéder à votre compte
                  </p>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  {errors?.login && (
                    <p className={styles.errorMessage}>
                      {errors.login}
                    </p>
                  )}

                  <div className={styles.formField}>
                    <Label htmlFor="login-email">Email</Label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="vous@exemple.com"
                        className={styles.inputWithIcon}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <Input
                        id="login-password"
                        type={showPwLogin ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className={styles.inputWithIcons}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwLogin((s) => !s)}
                        className={styles.togglePasswordButton}
                        aria-label={showPwLogin ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPwLogin ? <EyeOff className={styles.toggleIcon} /> : <Eye className={styles.toggleIcon} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.forgotPasswordSection}>
                    <span className={styles.forgotPasswordLabel}>Mot de passe oublié ?</span>
                    <a className={styles.forgotPasswordLink} href="#" onClick={(e) => e.preventDefault()}>
                      Réinitialiser
                    </a>
                  </div>

                  <Button className={styles.submitButton} onClick={handleLogin} disabled={loadingLogin}>
                    {loadingLogin && <Loader2 className={styles.loadingIcon} />} Se connecter
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className={styles.authCard}>
                <CardHeader className={styles.cardHeader}>
                  <CardTitle className={styles.cardTitle}>Créer votre compte</CardTitle>
                  <p className={styles.cardDescription}>
                    Rejoignez DevDocsHub et organisez vos documents
                  </p>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  {errors?.register && (
                    <p className={styles.errorMessage}>
                      {errors.register}
                    </p>
                  )}

                  <div className={styles.formField}>
                    <Label htmlFor="reg-name">Nom</Label>
                    <div className={styles.inputWrapper}>
                      <UserIcon className={styles.inputIcon} />
                      <Input
                        id="reg-name"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        placeholder="Ada Lovelace"
                        className={styles.inputWithIcon}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <Label htmlFor="reg-email">Email</Label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="vous@exemple.com"
                        className={styles.inputWithIcon}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <Input
                        id="reg-password"
                        type={showPwRegister ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Au moins 8 caractères"
                        className={styles.inputWithIcons}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwRegister((s) => !s)}
                        className={styles.togglePasswordButton}
                        aria-label={showPwRegister ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPwRegister ? <EyeOff className={styles.toggleIcon} /> : <Eye className={styles.toggleIcon} />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    <div className={styles.passwordStrength}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cx(
                            styles.strengthBar,
                            i < passwordScore(registerData.password) && styles.active
                          )}
                        />
                      ))}
                      <span className={styles.strengthText}>
                        Force : {passwordScore(registerData.password)}/5
                      </span>
                    </div>
                  </div>

                  <Button className={styles.submitButton} onClick={handleRegister} disabled={loadingRegister}>
                    {loadingRegister && <Loader2 className={styles.loadingIcon} />} Créer le compte
                  </Button>

                  <Separator />
                  <p className={styles.termsText}>
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
