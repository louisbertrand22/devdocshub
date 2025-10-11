"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function NoteForm({ onCreated }: { onCreated?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ doc_id: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiFetch("/notes", { method: "POST", body: JSON.stringify(form) }, apiBase, token);
      toast({ title: "Note added" });
      setForm({ doc_id: "", content: "" });
      onCreated?.();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Label>Doc ID (UUID)</Label>
        <Input value={form.doc_id} onChange={(e) => setForm({ ...form, doc_id: e.target.value })} placeholder="xxxxxxxx-xxxx-..." />
      </div>
      <div className="grid gap-1">
        <Label>Content</Label>
        <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Quick note…" />
      </div>
      <div>
        <Button onClick={submit} disabled={submitting}>{submitting ? "Saving..." : "Add note"}</Button>
      </div>
    </div>
  );
}
