-- =====================================================
-- MIGRAÇÃO V4: Melhorias na Auditoria
-- =====================================================
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/cptkatdswfyycsgedcte/sql/new
-- =====================================================

-- 1. Adicionar coluna detalhes (JSONB) para armazenar dados antes/depois
ALTER TABLE public.audit_log
ADD COLUMN IF NOT EXISTS detalhes JSONB;

-- 2. Adicionar coluna ip_address para registrar origem
ALTER TABLE public.audit_log
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 3. Index para busca textual na descrição (pg_trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_audit_log_descricao_trgm ON public.audit_log USING gin (descricao gin_trgm_ops);

-- 4. Index para filtro por usuário
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON public.audit_log(usuario_id);

-- 5. Index composto para consultas de paginação
CREATE INDEX IF NOT EXISTS idx_audit_log_data_acao ON public.audit_log(created_at DESC, acao);

-- =====================================================
-- Permissões para funções de auditoria
-- =====================================================
GRANT EXECUTE ON FUNCTION public.log_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit TO anon;
GRANT EXECUTE ON FUNCTION public.log_audit TO service_role;
