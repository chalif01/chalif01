CREATE TABLE public.vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('text','image','video')),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_items TO authenticated;
GRANT ALL ON public.vault_items TO service_role;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vault" ON public.vault_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins read vault files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='vault' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins upload vault files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='vault' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete vault files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='vault' AND public.has_role(auth.uid(),'admin'));