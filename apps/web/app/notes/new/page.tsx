"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";
import { PageHeader } from "@/components/page/page-header";

export default function NewNotePage() {
  return (
    <Suspense fallback={null}>
      <NewNoteForm />
    </Suspense>
  );
}

function NewNoteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { apiBase, token, user } = useAuth();
  const { status, docs, load } = useDocsStore();
  const { toast } = useToast();
  const [form, setForm] = useState({ doc_id: params.get("doc") ?? "", content: "", is_pinned: false });
  const [errors, setErrors] = useState<{ doc?: string; content?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);
  const backTo = form.doc_id ? `/docs/${form.doc_id}` : "/notes";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !user?.id) {
      setErrors({ form: "Tu dois être connecté pour créer une note." });
      return;
    }
    const next = {
      doc: form.doc_id ? undefined : "Choisis un doc.",
      content: form.content.trim() ? undefined : "Le contenu est requis.",
    };
    setErrors(next);
    if (next.doc || next.content) return;
    setSubmitting(true);
    try {
      const payload = { doc_id: form.doc_id, user_id: user.id, content: form.content, is_pinned: form.is_pinned };
      await apiFetch("/notes", { method: "POST", body: JSON.stringify(payload) }, apiBase, token);
      toast({ title: "Note créée", variant: "success" });
      router.push("/notes");
    } catch (err: any) {
      setErrors({ form: err?.message || "Impossible de créer la note." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="notes / nouvelle" title="Nouvelle note" description="Une note est toujours rattachée à un doc." />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        {errors.form && <Notice tone="danger">{errors.form}</Notice>}
        <Field label="Doc" htmlFor="doc_id" required error={errors.doc}>
          {status === "ready" && docs.length === 0 ? (
            <Notice>Aucun doc disponible : crée d'abord un doc.</Notice>
          ) : (
            <Select value={form.doc_id} onValueChange={(v) => setForm({ ...form, doc_id: v })} disabled={submitting}>
              <SelectTrigger id="doc_id">
                <SelectValue placeholder={status === "ready" ? "Choisir un doc" : "Chargement des docs…"} />
              </SelectTrigger>
              <SelectContent>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                    {d.tech ? ` · ~/${d.tech.trim().toLowerCase()}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
        <Field label="Contenu" htmlFor="note-content" required error={errors.content}>
          <Textarea
            id="note-content"
            rows={8}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Ce qu'il faut retenir…"
            disabled={submitting}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Checkbox
            id="note-pinned"
            checked={form.is_pinned}
            onCheckedChange={(v) => setForm({ ...form, is_pinned: Boolean(v) })}
            disabled={submitting}
          />
          <Label htmlFor="note-pinned" className="cursor-pointer font-normal">
            Épingler cette note
          </Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(backTo as Route)} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Création…" : "Créer la note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
