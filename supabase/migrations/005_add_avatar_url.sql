-- =====================================================
-- MIGRAÇÃO V5: Avatar/Photo do usuário
-- =====================================================
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/cptkatdswfyycsgedcte/sql/new
-- =====================================================

-- Adicionar coluna avatar_url na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
