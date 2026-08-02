import { supabase } from "@/integrations/supabase/client";

export type SiteProfile = {
  id: string;
  first_name: string;
  last_name: string;
  role_title: string;
  location: string;
  phone: string;
  email: string;
  instagram: string;
  whatsapp: string;
  quote: string;
  disciplines: string;
  profile_text: string;
  interests_text: string;
  portrait_url: string | null;
  cv_url: string | null;
};

export type SiteProject = {
  id: string;
  title: string;
  tag: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

export type SiteSkill = {
  id: string;
  name: string;
  value: number;
  sort_order: number;
};

export const MEDIA_BUCKET = "site-media";

/** Storage objects live in a private bucket, so turn a stored path into a viewable URL. */
export async function resolveMedia(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export type SiteData = {
  profile: SiteProfile | null;
  projects: SiteProject[];
  skills: SiteSkill[];
  portraitUrl: string | null;
  cvUrl: string | null;
  projectImages: Record<string, string | null>;
};

export async function loadSiteData(): Promise<SiteData> {
  const [profileRes, projectsRes, skillsRes] = await Promise.all([
    supabase.from("site_profile").select("*").eq("id", "main").maybeSingle(),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("sort_order"),
  ]);

  const profile = (profileRes.data as SiteProfile | null) ?? null;
  const projects = (projectsRes.data as SiteProject[] | null) ?? [];
  const skills = (skillsRes.data as SiteSkill[] | null) ?? [];

  const [portraitUrl, cvUrl, ...images] = await Promise.all([
    resolveMedia(profile?.portrait_url),
    resolveMedia(profile?.cv_url),
    ...projects.map((p) => resolveMedia(p.image_url)),
  ]);

  const projectImages: Record<string, string | null> = {};
  projects.forEach((p, i) => {
    projectImages[p.id] = images[i] ?? null;
  });

  return { profile, projects, skills, portraitUrl, cvUrl, projectImages };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}
