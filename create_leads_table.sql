-- =========================================================================
-- MAVIX CHILE - CONFIGURACIÓN DE BASE DE DATOS EN SUPABASE
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase 
-- (https://supabase.com -> Tu Proyecto -> SQL Editor -> New Query)
-- =========================================================================

-- 1. Crear la tabla de leads
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  company_name text not null,
  company_industry text not null,
  company_size text not null,
  company_website text,
  company_social text,
  client_message text,
  services text[] default '{}'::text[] not null
);

-- 2. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
-- Esto es CRÍTICO para proteger los datos de tus clientes.
alter table public.leads enable row level security;

-- 3. Crear política para permitir la inserción pública (desde la Landing Page)
-- Esto permite que cualquier visitante que envíe el formulario inserte datos utilizando la Anon Key.
create policy "Allow public inserts" on public.leads
  for insert
  with check (true);

-- NOTA DE SEGURIDAD: 
-- Como habilitamos RLS y NO definimos ninguna política de lectura (SELECT), modificación (UPDATE) 
-- ni eliminación (DELETE) para el rol público, la base de datos deniega automáticamente 
-- estas operaciones para usuarios anónimos.
-- Solo tú desde el panel de administración de Supabase (o mediante la Service Role Key de backend) 
-- podrás ver y gestionar los datos. Tu base de datos está 100% segura contra robo de información.
