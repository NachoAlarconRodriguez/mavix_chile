-- =========================================================================
-- SQL MIGRATION: SERVICES & TEAM_MEMBERS TABLES
-- =========================================================================

-- 1. Create team_members table if not exists
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    skills TEXT[],
    avatar_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Eliminar restricciones obsoletas de tipo de rol (CHECK constraints)
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_cargo_check;

-- 2. Create services table if not exists
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- SVG string
    bg_image TEXT, -- Background image path/name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies for team_members
DROP POLICY IF EXISTS "Allow public select on team_members" ON public.team_members;
CREATE POLICY "Allow public select on team_members" 
ON public.team_members 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow team members to manage team_members" ON public.team_members;
CREATE POLICY "Allow team members to manage team_members" 
ON public.team_members 
FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.team_members)
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.team_members)
);

-- 5. Set RLS Policies for services
DROP POLICY IF EXISTS "Allow public select on services" ON public.services;
CREATE POLICY "Allow public select on services" 
ON public.services 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow team members to manage services" ON public.services;
CREATE POLICY "Allow team members to manage services" 
ON public.services 
FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.team_members)
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.team_members)
);

-- 6. Insert seed data for team_members (Ignacio, Javier, Tahía)
INSERT INTO public.team_members (email, name, role, bio, skills, avatar_url, linkedin_url, instagram_url)
VALUES 
  (
    'ialarconr.684@gmail.com', 
    'Ignacio Alarcón', 
    'Diseñador UI/UX', 
    'Apasionado por crear interfaces elegantes, optimizadas para SEO, rápidas de cargar e increíblemente fluidas para el usuario.', 
    ARRAY['UI/UX Design', 'SEO Local', 'Figma Pro'], 
    'assets/ignacio_portrait.png', 
    '#', 
    '#'
  ),
  (
    'j.marquezn99@gmail.com', 
    'Javier Márquez', 
    'CEO & Fundador', 
    'Estratega de marketing enfocado en la rentabilidad de las inversiones digitales y el escalamiento del negocio.', 
    ARRAY['Estrategia CRO', 'Funnels', 'Adquisición'], 
    'assets/javier_portrait.png', 
    '#', 
    '#'
  ),
  (
    'tahia.montoya@gmail.com', -- placeholder for Tahia
    'Tahía Montoya', 
    'Social Media Manager', 
    'Especialista en estructuración de contenido, copywrite interactivo y gestión de comunidades orgánicas con alto engagement.', 
    ARRAY['Copywriting', 'Meta Ads', 'Growth Orgánico'], 
    'assets/tahia_portrait.png', 
    '#', 
    '#'
  )
ON CONFLICT (email) DO UPDATE 
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  skills = EXCLUDED.skills,
  avatar_url = EXCLUDED.avatar_url;

-- 7. Insert seed data for services
INSERT INTO public.services (key, title, description, icon)
VALUES 
  (
    'web', 
    'Desarrollo Web', 
    'Creamos sitios web ultra-rápidos, optimizados para SEO y conversiones. Enfoque premium en experiencia de usuario y rendimiento móvil.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
  ),
  (
    'social', 
    'Social Growth', 
    'Gestionamos e impulsamos tus redes sociales con contenido dinámico enfocado en generar comunidades activas.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  ),
  (
    'ads', 
    'Campañas Ads', 
    'Creamos y optimizamos campañas de conversión de pago en Google Ads y Meta Ads para rentabilizar tu inversión publicitaria.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
  ),
  (
    'branding', 
    'Branding y Diseño', 
    'Diseñamos identidades visuales, logotipos y manuales de marca para destacar en un mercado altamente competitivo.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 2Z"/><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"/></svg>'
  ),
  (
    'audiovisual', 
    'Fotografía & Video Dron', 
    'Creamos contenido de alta fidelidad para destacar en plataformas digitales. Capturamos tomas aéreas cinematográficas con drones de última generación y sesiones de fotografía comercial profesional.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'
  ),
  (
    'automations', 
    'Automatización & IA', 
    'Diseñamos e integramos flujos inteligentes para ahorrar tiempo. Conectamos tus formularios web a sistemas CRM, programamos respuestas automáticas en WhatsApp y sincronizamos bases de datos.', 
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>'
  )
ON CONFLICT (key) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;
