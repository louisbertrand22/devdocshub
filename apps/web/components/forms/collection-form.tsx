"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function CollectionForm({ onCreated }: { onCreated?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", description: "" });
  const [linkForm, setLinkForm] = useState({ collection_id: "", doc_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);

  const createCol = async () => {
    setSubmitting(true);
    try {
      await apiFetch("/collections/", { method: "POST", body: JSON.stringify(form) }, apiBase, token);
      toast({ title: "Collection created" });
      setForm({ name: "", description: "" });
      onCreated?.();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const linkDoc = async () => {
    setLinking(true);
    try {
      await apiFetch(`/collections/${linkForm.collection_id}/docs`, { method: "POST", body: JSON.stringify({ doc_id: linkForm.doc_id }) }, apiBase, token);
      toast({ title: "Doc linked" });
      setLinkForm({ collection_id: "", doc_id: "" });
      onCreated?.();
    } catch (e: any) {
      toast({ title: "Link failed", description: e.message, variant: "destructive" });
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <h3 className="text-lg font-semibold">New Collection</h3>
        <div className="grid gap-1">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Knowledge Base" />
        </div>
        <div className="grid gap-1">
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What goes in here?" />
        </div>
        <div>
          <Button onClick={createCol} disabled={submitting}>{submitting ? "Saving..." : "Create collection"}</Button>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-lg font-semibold">Link a Doc</h3>
        <div className="grid gap-1">
          <Label>Collection ID</Label>
          <Input value={linkForm.collection_id} onChange={(e) => setLinkForm({ ...linkForm, collection_id: e.target.value })} placeholder="UUID" />
        </div>
        <div className="grid gap-1">
          <Label>Doc ID</Label>
          <Input value={linkForm.doc_id} onChange={(e) => setLinkForm({ ...linkForm, doc_id: e.target.value })} placeholder="UUID" />
        </div>
        <div>
          <Button onClick={linkDoc} variant="secondary" disabled={linking}>{linking ? "Linking..." : "Link doc to collection"}</Button>
        </div>
      </div>
    </div>
  );
}
