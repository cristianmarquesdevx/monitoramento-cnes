-- =====================================================
-- MIGRAÇÃO V2: Auditoria + Admin
-- =====================================================

-- 1. Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_nome TEXT NOT NULL DEFAULT '',
  acao TEXT NOT NULL, -- 'approve', 'reject', 'controle', 'update', 'delete'
  tipo TEXT NOT NULL, -- 'solicitacao', 'profissional'
  target_id TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit visivel para todos logados"
  ON public.audit_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Audit insert para todos logados"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_acao ON public.audit_log(acao);

-- 2. Adicionar coluna audit_id na tabela solicitacoes
ALTER TABLE public.solicitacoes ADD COLUMN IF NOT EXISTS audit_id BIGINT REFERENCES public.audit_log(id);

-- 3. Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit(
  p_usuario_id UUID,
  p_usuario_nome TEXT,
  p_acao TEXT,
  p_tipo TEXT,
  p_target_id TEXT,
  p_descricao TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO public.audit_log (usuario_id, usuario_nome, acao, tipo, target_id, descricao)
  VALUES (p_usuario_id, p_usuario_nome, p_acao, p_tipo, p_target_id, p_descricao)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
