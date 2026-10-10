import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FileText, Loader2, LogOut, Moon, Plus, Sun, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";
import {
  loadSiteData,
  uploadMedia,
  type SiteProfile,
  type SiteProject,
  type SiteSkill,
} from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — Chalif Ali Hussein" },
      { name: "description", content: "Private dashboard to update portfolio details, photos and CV." },
      { property: "og:title", content: "Dashboard — Chalif Ali Hussein" },
      { property: "og:description", content: "Manage portfolio content, media and account password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const FIELDS: { key: keyof SiteProfile; label: string; area?: boolean }[] = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "role_title", label: "Role title" },
  { key: "location", label: "Location" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram handle" },
  { key: "whatsapp", label: "WhatsApp number (digits only)" },
  { key: "quote", label: "Quote" },
  { key: "disciplines", label: "Disciplines (comma separated)", area: true },
  { key: "profile_text", label: "Profile text", area: true },
  { key: "interests_text", label: "Interests & goals", area: true },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border px-6 py-12 sm:px-12">
      <h2 className="label-xs">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const inputCls =
  "mt-2 w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground";
const btnCls =
  "inline-flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.2em] transition-colors hover:bg-accent disabled:opacity-50";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const [admin, setAdmin] = useState<boolean | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["site-data"], queryFn: loadSiteData });

  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [skills, setSkills] = useState<SiteSkill[]>([]);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    (async () => {
      // Check the role directly in the browser so this works on any host (Lovable, Vercel, ...).
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setAdmin(false);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setAdmin(!!role);
    })().catch(() => setAdmin(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    setProfile(data.profile);
    setProjects(data.projects);
    setSkills(data.skills);
  }, [data]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["site-data"] });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const { id, ...rest } = profile;
    const { error } = await supabase.from("site_profile").update(rest).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Details saved");
    void refresh();
  }

  async function onUpload(file: File, folder: string, field: "portrait_url" | "cv_url") {
    if (!profile) return;
    setSaving(true);
    try {
      const path = await uploadMedia(file, folder);
      const { error } = await supabase
        .from("site_profile")
        .update({ [field]: path } as Partial<SiteProfile>)
        .eq("id", profile.id);
      if (error) throw error;
      setProfile({ ...profile, [field]: path });
      toast.success("Uploaded");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveProject(p: SiteProject) {
    const { id, ...rest } = p;
    const { error } = await supabase.from("projects").update(rest).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project saved");
    void refresh();
  }

  async function addProject() {
    const { error } = await supabase
      .from("projects")
      .insert({ title: "New project", tag: "Category", description: "", sort_order: projects.length + 1 });
    if (error) { toast.error(error.message); return; }
    void refresh();
  }

  async function removeProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    void refresh();
  }

  async function uploadProjectImage(p: SiteProject, file: File) {
    try {
      const path = await uploadMedia(file, "projects");
      const { error } = await supabase.from("projects").update({ image_url: path }).eq("id", p.id);
      if (error) throw error;
      toast.success("Photo updated");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function saveSkill(s: SiteSkill) {
    const { id, ...rest } = s;
    const { error } = await supabase.from("skills").update(rest).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Skill saved");
    void refresh();
  }

  async function addSkill() {
    const { error } = await supabase
      .from("skills")
      .insert({ name: "New skill", value: 50, sort_order: skills.length + 1 });
    if (error) { toast.error(error.message); return; }
    void refresh();
  }

  async function removeSkill(id: string) {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    void refresh();
  }

  async function changePassword() {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    setNewPassword("");
    toast.success("Password updated");
  }

  if (isLoading || admin === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="label-xs">Access denied</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This account is not an administrator of this portfolio.
        </p>
        <button onClick={signOut} className={btnCls}>
          <LogOut className="size-4" /> SIGN OUT
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-8 sm:px-12">
        <div>
          <p className="label-xs">Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">CONTROL PANEL</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className={btnCls}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link to="/" className={btnCls}>
            SITE
          </Link>
          <button onClick={signOut} className={btnCls}>
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <Section title="Profile photo & CV">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-4 border border-border p-6">
            <p className="text-sm font-bold tracking-[0.2em]">PROFILE PHOTO</p>
            {data?.portraitUrl ? (
              <img
                src={data.portraitUrl}
                alt="Current portrait"
                className="aspect-square w-32 object-cover object-top grayscale"
              />
            ) : (
              <p className="text-xs text-muted-foreground">Using default photo. Upload a new one below.</p>
            )}
            <label
              htmlFor="portrait"
              className={`${btnCls} cursor-pointer bg-foreground text-background hover:bg-foreground/80`}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              UPLOAD PHOTO
            </label>
            <input
              id="portrait"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f, "portrait", "portrait_url");
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex flex-col items-start gap-4 border border-border p-6">
            <p className="text-sm font-bold tracking-[0.2em]">CV DOCUMENT</p>
            {data?.cvUrl ? (
              <a href={data.cvUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                <FileText className="mr-1 inline size-4" /> View current CV
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">No CV uploaded yet. Visitors can't download it until you upload one.</p>
            )}
            <label
              htmlFor="cv"
              className={`${btnCls} cursor-pointer bg-foreground text-background hover:bg-foreground/80`}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              UPLOAD CV (PDF)
            </label>
            <input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f, "cv", "cv_url");
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </Section>

      <Section title="Personal details">
        <div className="grid gap-6 md:grid-cols-2">
          {profile &&
            FIELDS.map((f) => (
              <div key={f.key} className={f.area ? "md:col-span-2" : ""}>
                <label className="label-xs" htmlFor={f.key}>
                  {f.label}
                </label>
                {f.area ? (
                  <textarea
                    id={f.key}
                    rows={3}
                    value={(profile[f.key] as string) ?? ""}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <input
                    id={f.key}
                    value={(profile[f.key] as string) ?? ""}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
        </div>
        <button onClick={saveProfile} disabled={saving} className={`${btnCls} mt-8`}>
          SAVE DETAILS
        </button>
      </Section>


      <Section title="Projects">
        <div className="space-y-10">
          {projects.map((p, i) => (
            <div key={p.id} className="grid gap-4 border border-border p-5 md:grid-cols-2">
              <div>
                <label className="label-xs">Title</label>
                <input
                  value={p.title}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...p, title: e.target.value };
                    setProjects(next);
                  }}
                  className={inputCls}
                />
                <label className="label-xs mt-4 block">Category</label>
                <input
                  value={p.tag}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...p, tag: e.target.value };
                    setProjects(next);
                  }}
                  className={inputCls}
                />
                <label className="label-xs mt-4 block">Description</label>
                <textarea
                  rows={3}
                  value={p.description}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...p, description: e.target.value };
                    setProjects(next);
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                {data?.projectImages[p.id] && (
                  <img
                    src={data.projectImages[p.id] as string}
                    alt={p.title}
                    className="mb-3 aspect-[4/3] w-full object-cover grayscale"
                  />
                )}
                <label className="label-xs">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadProjectImage(p, e.target.files[0])}
                  className="mt-2 block w-full text-xs text-muted-foreground"
                />
                <div className="mt-5 flex gap-2">
                  <button onClick={() => saveProject(p)} className={btnCls}>
                    SAVE
                  </button>
                  <button onClick={() => removeProject(p.id)} className={btnCls}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addProject} className={`${btnCls} mt-8`}>
          <Plus className="size-4" /> ADD PROJECT
        </button>
      </Section>

      <Section title="Skills">
        <div className="space-y-4">
          {skills.map((s, i) => (
            <div key={s.id} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="label-xs">Skill</label>
                <input
                  value={s.name}
                  onChange={(e) => {
                    const next = [...skills];
                    next[i] = { ...s, name: e.target.value };
                    setSkills(next);
                  }}
                  className={inputCls}
                />
              </div>
              <div className="w-28">
                <label className="label-xs">Percent</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={s.value}
                  onChange={(e) => {
                    const next = [...skills];
                    next[i] = { ...s, value: Number(e.target.value) };
                    setSkills(next);
                  }}
                  className={inputCls}
                />
              </div>
              <button onClick={() => saveSkill(s)} className={btnCls}>
                SAVE
              </button>
              <button onClick={() => removeSkill(s.id)} className={btnCls}>
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addSkill} className={`${btnCls} mt-8`}>
          <Plus className="size-4" /> ADD SKILL
        </button>
      </Section>

      <Section title="Account password">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px]">
            <label className="label-xs" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <button onClick={changePassword} className={btnCls}>
            UPDATE PASSWORD
          </button>
        </div>
      </Section>
    </main>
  );
}
