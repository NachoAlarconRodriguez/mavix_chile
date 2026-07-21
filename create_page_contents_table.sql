-- =========================================================================
-- SQL MIGRATION: PAGE CONTENTS CMS TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.page_contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page TEXT NOT NULL, -- 'home', 'nosotros', 'servicios', 'casos', 'contacto'
    section TEXT NOT NULL, -- 'hero', 'labs', 'header', 'info'
    key TEXT UNIQUE NOT NULL, -- 'home_hero_title', etc.
    content TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'text' NOT NULL, -- 'text' or 'textarea'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- Select policy (public)
DROP POLICY IF EXISTS "Allow public select on page_contents" ON public.page_contents;
CREATE POLICY "Allow public select on page_contents" 
ON public.page_contents 
FOR SELECT 
USING (true);

-- Manage policy (team members only, using the secure function)
DROP POLICY IF EXISTS "Allow team members to manage page_contents" ON public.page_contents;
CREATE POLICY "Allow team members to manage page_contents" 
ON public.page_contents 
FOR ALL 
TO authenticated 
USING (public.is_team_member())
WITH CHECK (public.is_team_member());

-- Insert seed data for index.html (home)
INSERT INTO public.page_contents (page, section, key, label, type, content)
VALUES
  ('home', 'hero', 'home_hero_title', 'Título Principal Hero', 'text', 'Soluciones Digitales de Alto Rendimiento'),
  ('home', 'hero', 'home_hero_subtitle', 'Subtítulo Hero', 'textarea', 'Diseño web premium, automatizaciones con IA y campañas de conversión optimizadas para acelerar tu negocio.'),
  ('home', 'labs', 'home_labs_tag', 'Etiqueta de Sección Labs', 'text', 'Mavix Labs & Studio'),
  ('home', 'labs', 'home_labs_title', 'Título de Sección Labs', 'text', 'Soluciones Avanzadas para tu Marca'),
  ('home', 'labs', 'home_labs_desc', 'Descripción de Sección Labs', 'textarea', 'Llevamos tu negocio al siguiente nivel con producción de contenido audiovisual cinematográfico y automatización de procesos mediante Inteligencia Artificial.')
ON CONFLICT (key) DO UPDATE 
SET 
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Insert seed data for equipo.html (nosotros)
INSERT INTO public.page_contents (page, section, key, label, type, content)
VALUES
  ('nosotros', 'header', 'team_header_tag', 'Etiqueta de Cabecera Nosotros', 'text', 'Conoce al Equipo'),
  ('nosotros', 'header', 'team_header_title', 'Título de Cabecera Nosotros', 'text', 'Las Mentes Detrás del Código y la Estrategia'),
  ('nosotros', 'header', 'team_header_desc', 'Descripción de Cabecera Nosotros', 'textarea', 'Un grupo compacto de especialistas comprometidos con la excelencia técnica, el diseño interactivo y la optimización de tus conversiones.')
ON CONFLICT (key) DO UPDATE 
SET 
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Insert seed data for servicios.html (servicios)
INSERT INTO public.page_contents (page, section, key, label, type, content)
VALUES
  ('servicios', 'header', 'services_header_tag', 'Etiqueta de Cabecera Servicios', 'text', 'Nuestros Servicios'),
  ('servicios', 'header', 'services_header_title', 'Título de Cabecera Servicios', 'text', 'Estrategias a la Medida de tu Negocio'),
  ('servicios', 'header', 'services_header_desc', 'Descripción de Cabecera Servicios', 'textarea', 'Combinamos diseño de vanguardia, ingeniería web y optimización de conversión para entregar resultados reales. Navega por nuestras áreas de especialización.')
ON CONFLICT (key) DO UPDATE 
SET 
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Insert seed data for casos.html (casos)
INSERT INTO public.page_contents (page, section, key, label, type, content)
VALUES
  ('casos', 'header', 'cases_header_tag', 'Etiqueta de Cabecera Casos', 'text', 'Casos de Éxito'),
  ('casos', 'header', 'cases_header_title', 'Título de Cabecera Casos', 'text', 'Resultados Reales de Marcas que Escalaron'),
  ('casos', 'header', 'cases_header_desc', 'Descripción de Cabecera Casos', 'textarea', 'Explora cómo transformamos desafíos de conversión, SEO y optimización LCP en casos de crecimiento medible para nuestros clientes.')
ON CONFLICT (key) DO UPDATE 
SET 
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Insert seed data for contacto.html (contacto)
INSERT INTO public.page_contents (page, section, key, label, type, content)
VALUES
  ('contacto', 'header', 'contact_header_tag', 'Etiqueta de Cabecera Contacto', 'text', '¿Listo para Escalar?'),
  ('contacto', 'header', 'contact_header_title', 'Título de Cabecera Contacto', 'text', 'Hablemos de tu Proyecto'),
  ('contacto', 'header', 'contact_header_desc', 'Descripción de Cabecera Contacto', 'textarea', 'Completa el formulario interactivo para agendar una sesión estratégica. Analizaremos tu web y propondremos una ruta de optimización sin costo.'),
  ('contacto', 'info', 'contact_info_email', 'Correo de Contacto', 'text', 'contacto@mavixchile.com'),
  ('contacto', 'info', 'contact_info_phone', 'Teléfono de Contacto', 'text', '+56 9 1234 5678'),
  ('contacto', 'info', 'contact_info_whatsapp', 'Enlace de WhatsApp (Directo)', 'text', 'https://wa.me/56912345678')
ON CONFLICT (key) DO UPDATE 
SET 
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  content = EXCLUDED.content;
