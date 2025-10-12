"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Loader2, FileText, Folder, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import "./profile.css";

type UserDetails = {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
};

type UserStats = {
  docs?: number;
  collections?: number;
  notes?: number;
};

export default function Profile() {
  const { token, apiBase, user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [stats, setStats] = useState<UserStats>({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) {
        setError("Non authentifié. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<UserDetails>("/auth/me", {}, apiBase, token);
        setUserDetails(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token, apiBase]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !userDetails?.id) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const [docsCount, collectionsCount, notesCount] = await Promise.all([
          apiFetch<number>("/docs/count", {}, apiBase, token).catch(() => undefined),
          apiFetch<number>("/collections/count/mine", {}, apiBase, token).catch(() => undefined),
          apiFetch<number>(`/notes/count/mine?uuid=${userDetails.id}`, {}, apiBase, token).catch(() => undefined),
        ]);

        setStats({
          docs: docsCount,
          collections: collectionsCount,
          notes: notesCount,
        });
      } catch (e: any) {
        console.error("Error fetching stats:", e);
      } finally {
        setStatsLoading(false);
      }
    };

    if (userDetails?.id) {
      fetchStats();
    }
  }, [token, apiBase, userDetails?.id]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-muted-foreground mt-2">Chargement de votre profil...</p>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="profile-error">
        <p className="text-destructive">{error || "Impossible de charger le profil"}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Veuillez vous connecter pour accéder à votre profil.
        </p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Obtenir les initiales pour l'avatar
  const initials = userDetails.username
    ? userDetails.username.substring(0, 2).toUpperCase()
    : userDetails.email.substring(0, 2).toUpperCase();

  return (
    <div className="profile-container">
      {/* Carte principale avec avatar et informations de base */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="profile-main-card">
          <CardContent className="profile-main-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">{initials}</div>
              <div className="profile-user-info">
                <h2 className="profile-username">{userDetails.username}</h2>
                <p className="profile-email">{userDetails.email}</p>
                <Badge variant="secondary" className="profile-role-badge">
                  {userDetails.role === "admin" ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cartes d'informations détaillées */}
      <div className="profile-details-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <User className="h-5 w-5" />
                <span>Nom d'utilisateur</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="profile-info-value">{userDetails.username}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <Mail className="h-5 w-5" />
                <span>Adresse email</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="profile-info-value">{userDetails.email}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <Shield className="h-5 w-5" />
                <span>Rôle</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="profile-info-value">
                {userDetails.role === "admin" ? "Administrateur" : "Utilisateur"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <Calendar className="h-5 w-5" />
                <span>Membre depuis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="profile-info-value">{formatDate(userDetails.created_at)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-8"
      >
        <h3 className="text-lg font-semibold mb-4">Mes statistiques</h3>
        <div className="profile-details-grid">
          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <FileText className="h-5 w-5" />
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="profile-info-value">{stats.docs ?? "—"}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Total documents</p>
            </CardContent>
          </Card>

          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <Folder className="h-5 w-5" />
                <span>Collections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="profile-info-value">{stats.collections ?? "—"}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mes collections</p>
            </CardContent>
          </Card>

          <Card className="profile-info-card">
            <CardHeader className="profile-info-header">
              <CardTitle className="profile-info-title">
                <StickyNote className="h-5 w-5" />
                <span>Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="profile-info-value">{stats.notes ?? "—"}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Mes notes</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
