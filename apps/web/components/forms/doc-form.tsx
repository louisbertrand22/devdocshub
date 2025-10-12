"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function DocForm({ onCreated }: { onCreated?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", slug: "", tech: "", content: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title,
        slug: form.slug,
        tech: form.tech,
        content: form.content,
      };
      if (form.tags.trim()) payload.tags = form.tags.split(",").map((t) => t.trim());
      await apiFetch("/docs/add", { method: "POST", body: JSON.stringify(payload) }, apiBase, token);
      toast({ title: "Document created" });
      setForm({ title: "", slug: "", tech: "", content: "", tags: "" });
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
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My guide" />
      </div>
      <div className="grid gap-1">
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-guide" />
      </div>
      <div className="grid gap-1">
        <Label>Tech</Label>
        <Input value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} placeholder="python, javascript, etc." />
      </div>
      <div className="grid gap-1">
        <Label>Content (Markdown)</Label>
        <Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="# Intro..." />
      </div>
      <div className="grid gap-1">
        <Label>Tags (comma-separated)</Label>
        <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="backend, python" />
      </div>
      <div>
        <Button onClick={submit} disabled={submitting}>{submitting ? "Saving..." : "Create"}</Button>
      </div>
    </div>
  );
}
