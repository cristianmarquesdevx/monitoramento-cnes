-- =====================================================
-- MIGRAÇÃO: Tabela de Perfis (Profiles)
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase
-- (https://supabase.com/dashboard/project/_/sql/new)
-- =====================================================

-- 1. Criar ENUM de roles
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- 2. Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
-- Qualquer usuário logado pode ver perfis
CREATE POLICY "Usuários logados podem ver perfis"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas admins podem criar/editar perfis
CREATE POLICY "Admins podem inserir perfis"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR id = auth.uid() -- Usuário pode criar seu próprio perfil (via trigger)
  );

CREATE POLICY "Admins podem atualizar perfis"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR id = auth.uid() -- Usuário pode atualizar seu próprio perfil (nome, etc)
  );

-- 5. Função trigger: criar profile automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    'viewer'
  );
  RETURN NEW;
END;
$$;

-- 6. Trigger que executa a função acima
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Seed: definir primeiro admin (SUBSTITUA pelo UUID do seu usuário)
-- Para descobrir seu UUID: SELECT id, email FROM auth.users;
-- Depois execute:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'SEU-UUID-AQUI';

-- 8. Index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
