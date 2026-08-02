CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.site_profile (
  id text PRIMARY KEY DEFAULT 'main',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  role_title text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  quote text NOT NULL DEFAULT '',
  disciplines text NOT NULL DEFAULT '',
  profile_text text NOT NULL DEFAULT '',
  interests_text text NOT NULL DEFAULT '',
  portrait_url text,
  cv_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_profile TO authenticated;
GRANT ALL ON public.site_profile TO service_role;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile is publicly viewable" ON public.site_profile FOR SELECT USING (true);
CREATE POLICY "Admins can update profile" ON public.site_profile FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert profile" ON public.site_profile FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_profile_updated_at BEFORE UPDATE ON public.site_profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are publicly viewable" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  value integer NOT NULL DEFAULT 50,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are publicly viewable" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins can manage skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_profile (id, first_name, last_name, role_title, location, phone, email, instagram, whatsapp, quote, disciplines, profile_text, interests_text)
VALUES ('main', 'CHALIF', 'ALI HUSSEIN', 'IT Systems Specialist', 'KIGALI, RWANDA', '+250 794 744 054', 'chalifhussein@gmail.com', 'chalif01_', '250794744054',
'NO HATE FORMED AGAINST ME SHALL PROSPER',
'IT SYSTEMS, NETWORK INFRASTRUCTURE, COMPUTER HARDWARE, CYBER SECURITY, WINDOWS SERVER',
'Dedicated and passionate IT professional with expertise in computer systems, network infrastructure and cyber security. Currently pursuing TVET certification in Computer Systems. Eager to apply technical knowledge and problem-solving skills in a professional environment while continuously expanding expertise in emerging technologies.',
'Forex market analysis, emerging technologies, and building reliable infrastructure. Long-term goal: becoming a certified systems and security engineer while trading consistently with disciplined risk management.');

INSERT INTO public.skills (name, value, sort_order) VALUES
('Computer Hardware', 95, 1),
('IT Systems', 90, 2),
('Network Infrastructure', 85, 3),
('Cyber Security', 80, 4),
('Windows Server', 85, 5),
('Technical Support', 92, 6),
('Forex Trading & Market Analysis', 70, 7);

INSERT INTO public.projects (title, tag, description, sort_order) VALUES
('Computer System Repair & Maintenance', 'Computer Hardware', 'Complete desktop disassembly, diagnostics and repair including monitor calibration and hardware troubleshooting.', 1),
('Motherboard & Component Assembly', 'Computer Hardware', 'Motherboard inspection, CPU installation, RAM upgrades and cooling system maintenance for optimal performance.', 2),
('BTC/USD Live Chart Analysis', 'Forex Trading', 'Live market analysis — identifying entry zones, support/resistance and momentum shifts on lower timeframes.', 3),
('Multi-Monitor Trading Setup', 'Forex Trading', 'Active forex market analysis across multiple monitors — applying strict risk management and intermediate strategies.', 4);