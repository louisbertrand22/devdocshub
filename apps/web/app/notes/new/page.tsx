"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

export default function NewNotePage() {
  const router = useRouter();
  const { apiBase, token, user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    doc_id: "",
    content: "",
    is_pinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user?.id) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer une note.",
        variant: "destructive",
      });
      return;
    }

    if (!form.doc_id || !form.content) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir l'ID du document et le contenu.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doc_id: form.doc_id,
        user_id: user.id,
        content: form.content,
        is_pinned: form.is_pinned,
      };

      await apiFetch(
        "/notes",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        apiBase,
        token
      );

      toast({
        title: "Note créée",
        description: "La note a été créée avec succès.",
      });

      // Redirect to notes list
      router.push("/notes");
    } catch (e: any) {
      toast({
        title: "Erreur de création",
        description: e.message || "Impossible de créer la note.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/notes");
  };

  return (
    <PageWrapper
      title="Nouvelle note"
      description="Créer une nouvelle note associée à un document"
    >
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border bg-background p-6 space-y-4">
            {/* Doc ID Field */}
            <div className="space-y-2">
              <Label htmlFor="doc_id">
                ID du document (UUID) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc_id"
                value={form.doc_id}
                onChange={(e) => setForm({ ...form, doc_id: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
                disabled={submitting}
              />
              <p className="text-sm text-muted-foreground">
                L'UUID du document auquel cette note sera associée.
              </p>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Contenu <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Écrivez votre note ici..."
                rows={8}
                required
                disabled={submitting}
              />
              <p className="text-sm text-muted-foreground">
                Le contenu de votre note.
              </p>
            </div>

            {/* Pinned Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_pinned"
                checked={form.is_pinned}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_pinned: Boolean(checked) })
                }
                disabled={submitting}
              />
              <Label
                htmlFor="is_pinned"
                className="text-sm font-normal cursor-pointer"
              >
                Épingler cette note
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Création en cours..." : "Créer la note"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
