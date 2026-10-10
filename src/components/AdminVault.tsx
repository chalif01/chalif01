import { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

type Item = {
  id: string;
  kind: "text" | "image" | "video";
  title: string;
  content: string;
  file_path: string | null;
  created_at: string;
  url?: string | null;
};

const inputCls =
  "mt-2 w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground";
const btnCls =
  "inline-flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.2em] transition-colors hover:bg-accent disabled:opacity-50";

export function AdminVault() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shown, setShown] = useState<Record<string, boolean>>({});

  async function load() {
    const { data, error } = await supabase
      .from("vault_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const rows = (data ?? []) as Item[];
    const withUrls = await Promise.all(
      rows.map(async (r) => {
        if (!r.file_path) return r;
        const { data: s } = await supabase.storage.from("vault").createSignedUrl(r.file_path, 3600);
        return { ...r, url: s?.signedUrl ?? null };
      }),
    );
    setItems(withUrls);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function addText() {
    if (!title.trim() && !content.trim()) { toast.error("Write something first"); return; }
    setBusy(true);
    const { error } = await supabase.from("vault_items").insert({ kind: "text", title, content });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setContent("");
    toast.success("Saved");
    void load();
  }

  async function addFile(file: File) {
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!kind) { toast.error("Only images and videos"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${kind}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("vault").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase
        .from("vault_items")
        .insert({ kind, title: file.name, file_path: path });
      if (error) throw error;
      toast.success("Uploaded");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`Delete "${item.title || "this item"}"?`)) return;
    if (item.file_path) await supabase.storage.from("vault").remove([item.file_path]);
    const { error } = await supabase.from("vault_items").delete().eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    void load();
  }

  const texts = items.filter((i) => i.kind === "text");
  const media = items.filter((i) => i.kind !== "text");

  return (
    <div className="space-y-10">
      <p className="text-xs text-muted-foreground">
        Private — only you (the admin) can see anything stored here.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-sm font-bold tracking-[0.2em]">SAVE TEXT / PASSWORD</p>
          <label className="label-xs mt-4 block">Title (e.g. Gmail password)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          <label className="label-xs mt-4 block">Content</label>
          <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} className={inputCls} />
          <button onClick={addText} disabled={busy} className={`${btnCls} mt-4`}>
            <Plus className="size-4" /> SAVE
          </button>
        </div>
        <div className="flex flex-col items-start gap-4 border border-border p-6">
          <p className="text-sm font-bold tracking-[0.2em]">UPLOAD IMAGES / VIDEOS</p>
          <label htmlFor="vault-file" className={`${btnCls} cursor-pointer bg-foreground text-background hover:bg-foreground/80`}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} CHOOSE FILES
          </label>
          <input
            id="vault-file"
            type="file"
            multiple
            accept="image/*,video/*"
            className="sr-only"
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              for (const f of files) await addFile(f);
            }}
          />
        </div>
      </div>

      {loading ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div>
            <p className="label-xs">Saved texts ({texts.length})</p>
            <div className="mt-4 space-y-3">
              {texts.map((t) => (
                <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 border border-border p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{t.title || "Untitled"}</p>
                    <p className="mt-1 whitespace-pre-wrap break-all font-mono text-sm text-muted-foreground">
                      {shown[t.id] ? t.content : "•".repeat(Math.min(t.content.length || 8, 24))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button aria-label="Show or hide" className={btnCls} onClick={() => setShown({ ...shown, [t.id]: !shown[t.id] })}>
                      {shown[t.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button aria-label="Copy" className={btnCls} onClick={() => { void navigator.clipboard.writeText(t.content); toast.success("Copied"); }}>
                      <Copy className="size-4" />
                    </button>
                    <button aria-label="Delete" className={btnCls} onClick={() => remove(t)}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs">Images & videos ({media.length})</p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {media.map((m) => (
                <div key={m.id} className="border border-border p-2">
                  {m.url && m.kind === "image" && (
                    <a href={m.url} target="_blank" rel="noreferrer">
                      <img src={m.url} alt={m.title} className="aspect-square w-full object-cover" />
                    </a>
                  )}
                  {m.url && m.kind === "video" && (
                    <video src={m.url} controls className="aspect-square w-full bg-muted object-cover" />
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">{m.title}</p>
                    <button aria-label="Delete" onClick={() => remove(m)} className="p-1 hover:bg-accent">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
