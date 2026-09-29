"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { slugify } from "@/lib/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

type Errors = Partial<Record<"title" | "slug" | "tech" | "form", string>>;
const EMPTY = { title: "", slug: "", tech: "", content: "", tags: "" };

export default function DocForm({ onCreated, onCancel }: { onCreated?: () => void; onCancel?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function setTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "Le titre est requis.";
    if (!form.slug.trim()) e.slug = "Le slug est requis.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) e.slug = "Minuscules, chiffres et tirets uniquement.";
    if (!form.tech.trim()) e.tech = "La techno est requise.";
    return e;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug,
        tech: form.tech.trim(),
        content: form.content,
      };
      if (form.tags.trim()) payload.tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await apiFetch("/docs/add", { method: "POST", body: JSON.stringify(payload) }, apiBase, token);
      toast({ title: "Doc créé", variant: "success" });
      setForm(EMPTY);
      setSlugTouched(false);
      useDocsStore.getState().invalidate();
      onCreated?.();
    } catch (err: any) {
      setErrors({ form: err?.message || "Impossible de créer le doc." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      {errors.form && <Notice tone="danger">{errors.form}</Notice>}
      <Field label="Titre" htmlFor="doc-title" required error={errors.title}>
        <Input id="doc-title" value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="Déployer avec Docker Compose" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" htmlFor="doc-slug" required error={errors.slug} hint="Proposé à partir du titre.">
          <Input
            id="doc-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: e.target.value });
            }}
            placeholder="deployer-avec-docker-compose"
            className="font-mono"
          />
        </Field>
        <Field label="Techno" htmlFor="doc-tech" required error={errors.tech} hint="Sert à ranger le doc (~/docker…).">
          <Input id="doc-tech" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} placeholder="docker" />
        </Field>
      </div>
      <Field label="Contenu" htmlFor="doc-content" hint="Markdown. Les titres ## et ### alimentent le sommaire.">
        <Textarea
          id="doc-content"
          rows={14}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={"## Introduction\n\n…"}
          className="font-mono text-[13px]"
        />
      </Field>
      <Field label="Tags" htmlFor="doc-tags" hint="Séparés par des virgules.">
        <Input id="doc-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="backend, prod" />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création…" : "Créer le doc"}
        </Button>
      </div>
    </form>
  );
}
