"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

type Collection = { id: string; name: string };

export default function CollectionForm({ onCreated }: { onCreated?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const { docs, load } = useDocsStore();
  const [form, setForm] = useState({ name: "", description: "" });
  const [link, setLink] = useState({ collection_id: "", doc_id: "" });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [errors, setErrors] = useState<{ name?: string; create?: string; link?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!token) return;
    void load(token, apiBase);
    apiFetch<Collection[]>("/collections/", {}, apiBase, token)
      .then((c) => setCollections(Array.isArray(c) ? c : []))
      .catch(() => setCollections([]));
  }, [token, apiBase, load]);

  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);

  async function createCollection(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setErrors({ name: "Le nom est requis." });
    setErrors({});
    setSubmitting(true);
    try {
      await apiFetch("/collections/", { method: "POST", body: JSON.stringify(form) }, apiBase, token);
      toast({ title: "Collection créée", variant: "success" });
      setForm({ name: "", description: "" });
      onCreated?.();
    } catch (err: any) {
      setErrors({ create: err?.message || "Impossible de créer la collection." });
    } finally {
      setSubmitting(false);
    }
  }

  async function linkDoc(e: FormEvent) {
    e.preventDefault();
    if (!link.collection_id || !link.doc_id) return setErrors({ link: "Choisis une collection et un doc." });
    setErrors({});
    setLinking(true);
    try {
      await apiFetch(`/collections/${link.collection_id}/docs`, { method: "POST", body: JSON.stringify({ doc_id: link.doc_id }) }, apiBase, token);
      toast({ title: "Doc ajouté à la collection", variant: "success" });
      setLink({ collection_id: "", doc_id: "" });
      onCreated?.();
    } catch (err: any) {
      setErrors({ link: err?.message || "Impossible d'ajouter le doc." });
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={createCollection} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base">Nouvelle collection</h2>
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

      <form onSubmit={linkDoc} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base">Ajouter un doc à une collection</h2>
        {errors.link && <Notice tone="danger">{errors.link}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Collection" htmlFor="link-collection">
            <Select value={link.collection_id} onValueChange={(v) => setLink({ ...link, collection_id: v })}>
              <SelectTrigger id="link-collection">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Doc" htmlFor="link-doc">
            <Select value={link.doc_id} onValueChange={(v) => setLink({ ...link, doc_id: v })}>
              <SelectTrigger id="link-doc">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={linking}>
            {linking ? "Ajout…" : "Ajouter le doc"}
          </Button>
        </div>
      </form>
    </div>
  );
}
