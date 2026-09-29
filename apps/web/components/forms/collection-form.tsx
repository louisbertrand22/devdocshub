"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

type Collection = { id: string; name: string };

export default function CollectionForm({ onCreated }: { onCreated?: (collection: Collection) => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; create?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function createCollection(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setErrors({ name: "Le nom est requis." });
    setErrors({});
    setSubmitting(true);
    try {
      const created = await apiFetch<Collection>("/collections/", { method: "POST", body: JSON.stringify(form) }, apiBase, token);
      toast({ title: "Collection créée", variant: "success" });
      setForm({ name: "", description: "" });
      onCreated?.(created);
    } catch (err: any) {
      setErrors({ create: err?.message || "Impossible de créer la collection." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={createCollection} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      {errors.create && <Notice tone="danger">{errors.create}</Notice>}
      <Field label="Nom" htmlFor="col-name" required error={errors.name}>
        <Input id="col-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Backend" />
      </Field>
      <Field label="Description" htmlFor="col-description">
        <Input
          id="col-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Ce qu'on range ici"
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création…" : "Créer la collection"}
        </Button>
      </div>
    </form>
  );
}
