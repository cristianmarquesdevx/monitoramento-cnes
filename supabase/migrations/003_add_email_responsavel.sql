-- ============================================================
-- MIGRAÇÃO: Adicionar coluna de e-mail do responsável
-- ============================================================
-- Execute este SQL no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/cptkatdswfyycsgedcte/sql/new
-- ============================================================

-- 1. Adicionar coluna email_responsavel
ALTER TABLE unidades_saude
ADD COLUMN IF NOT EXISTS email_responsavel TEXT;

-- 2. Verificar a estrutura atualizada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'unidades_saude' 
ORDER BY ordinal_position;

-- 3. (Opcional) Ver unidades sem email cadastrado
SELECT cnes, nome_unidade, responsavel, email_responsavel
FROM unidades_saude
WHERE email_responsavel IS NULL
ORDER BY nome_unidade;

-- ============================================================
-- INSTRUÇÕES PARA CONFIGURAR O ENVIO DE E-MAIL
-- ============================================================
--
-- 1. Crie uma conta gratuita em https://resend.com
-- 2. Vá em https://resend.com/api-keys e crie uma API Key
-- 3. No terminal (com Supabase CLI instalado):
--    supabase secrets set RESEND_API_KEY=re_XXXXXXXXXXXXX
-- 4. Faça deploy da Edge Function:
--    supabase functions deploy enviar-email-relacionar --no-verify-jwt
-- ============================================================
