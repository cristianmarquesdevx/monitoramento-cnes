import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { listaCBO } from '../data/cboData';
import Modal from './Modal';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const EMPTY = Object.freeze({});

const opcoesVinculo = [
  'Estatutário', 'Contrato', 'CLT', 'Temporário', 'Autônomo',
  'Outros', 'Residente', 'Contrato Temporário', 'Prestador de Serviços',
  'Cooperado', 'Estagiário', 'Voluntário'
];

const CAMPOS = [
  { key: 'nome_profissional', label: 'Nome Completo' },
  { key: 'cpf', label: 'CPF' },
  { key: 'cns', label: 'CNS (15 dígitos)' },
  { key: 'cnes', label: 'CNES', type: 'select', optionsKey: 'cnes' },
  { key: 'cbo', label: 'CBO', type: 'select', optionsKey: 'cbo' },
  { key: 'conselho', label: 'Conselho' },
  { key: 'registro', label: 'N° Registro' },
  { key: 'uf_conselho', label: 'UF Conselho' },
  { key: 'cargo_funcao', label: 'Cargo/Função' },
  { key: 'tipo_vinculo', label: 'Tipo Vínculo', type: 'select', optionsKey: 'vinculo' },
  { key: 'carga_horaria', label: 'Carga Horária' },
  { key: 'setor_equipe', label: 'Setor/Equipe' },
];

function formatValor(key, value, unidades) {
  if (!value && value !== 0) return '—';
  if (key === 'cnes' && unidades?.length > 0) {
    const uni = unidades.find(u => u.cnes === value);
    return uni ? `${uni.cnes} - ${uni.nome_unidade}` : value;
  }
  if (key === 'cbo' && listaCBO.length > 0) {
    const cbo = listaCBO.find(c => c.codigo === value);
    return cbo ? `${cbo.codigo} - ${cbo.descricao}` : value;
  }
  return value;
}

function getOptions(key, unidades) {
  if (key === 'cnes') return (unidades || []).map(u => ({ value: u.cnes, text: `${u.cnes} - ${u.nome_unidade}` }));
  if (key === 'cbo') return listaCBO.map(c => ({ value: c.codigo, text: `${c.codigo} - ${c.descricao}` }));
  if (key === 'vinculo') return opcoesVinculo.map(v => ({ value: v, text: v }));
  return [];
}

export default function ApprovalModal({ isOpen, onClose, solicitacao, unidades, profissionais, onComplete, currentUser }) {
  const [editData, setEditData] = useState({});
  const [processando, setProcessando] = useState(false);

  const sol = solicitacao;
  const antigos = sol?.dados_antigos ?? EMPTY;
  const novos = sol?.dados_novos ?? EMPTY;

  useEffect(() => {
    if (sol) setEditData({ ...novos });
  }, [sol, novos]);

  if (!sol) return null;

  const prof = profissionais.find(p => p.id === sol.profissional_id);
  const nomeProf = prof?.nome_profissional || antigos.nome_profissional || `ID ${sol.profissional_id}`;

  const handleChange = (key, value) => setEditData(prev => ({ ...prev, [key]: value }));

  const logAudit = async (acao, descricao) => {
    try {
      await supabase.rpc('log_audit', {
        p_usuario_id: currentUser?.id || '',
        p_usuario_nome: currentUser?.nome || 'Sistema',
        p_acao: acao,
        p_tipo: 'solicitacao',
        p_target_id: sol.id,
        p_descricao: descricao
      });
    } catch (e) {
      console.error('Erro ao registrar auditoria:', e.message);
    }
  };

  const handleRejeitar = async () => {
    if (!window.confirm(`Rejeitar esta solicitação de "${nomeProf}"?`)) return;
    setProcessando(true);
    try {
      await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', sol.id);
      await logAudit('reject', `Rejeitou ${sol.tipo === 'update' ? 'alteração' : 'exclusão'} de "${nomeProf}"`);
      alert(`✅ Solicitação rejeitada.`);
      onComplete?.();
      onClose();
    } catch (e) {
      alert('❌ Erro: ' + e.message);
    } finally {
      setProcessando(false);
    }
  };

  function construirDetalhesAlteracao() {
    const campos = [];
    CAMPOS.forEach(campo => {
      const de = antigos[campo.key];
      const para = editData[campo.key];
      if ((de || '') !== (para || '')) {
        campos.push({ nome: campo.key, label: campo.label, de: de || '', para: para || '' });
      }
    });
    return campos.length > 0 ? { campos } : null;
  }

  const handleConfirmar = async () => {
    if (sol.tipo === 'delete') {
      if (!window.confirm(`EXCLUIR "${nomeProf}"?`)) return;
      setProcessando(true);
      try {
        await supabase.from('profissionais').delete().eq('id', sol.profissional_id);
        await supabase.from('solicitacoes').update({ status: 'aprovado', aprovado_em: new Date().toISOString() }).eq('id', sol.id);
        await logAudit('approve', `Aprovou exclusão de "${nomeProf}"`);
        alert('✅ Exclusão aprovada.');
        onComplete?.();
        onClose();
      } catch (e) {
        alert('❌ Erro: ' + e.message);
      } finally {
        setProcessando(false);
      }
      return;
    }

    if (!window.confirm('Confirmar alteração?')) return;
    setProcessando(true);
    try {
      await supabase.from('profissionais').update(editData).eq('id', sol.profissional_id);
      await supabase.from('solicitacoes').update({ status: 'aprovado', aprovado_em: new Date().toISOString() }).eq('id', sol.id);

      // Descrição rica com campos alterados embutidos
      const detalhes = construirDetalhesAlteracao();
      const qtdCampos = detalhes?.campos?.length || 0;
      // Embutir JSON dos detalhes na descrição para o AuditLog conseguir expandir
      const detalhesStr = detalhes ? '|||' + JSON.stringify(detalhes) + '|||' : '';
      const descricao = `Aprovou alteração de "${nomeProf}" — ${qtdCampos} campo(s) alterado(s)` + detalhesStr;
      await logAudit('approve', descricao);

      alert('✅ Alteração aprovada.');
      onComplete?.();
      onClose();
    } catch (e) {
      alert('❌ Erro: ' + e.message);
    } finally {
      setProcessando(false);
    }
  };

  const campoAlterado = (campo) => {
    if (sol.tipo === 'delete') return false;
    return (antigos[campo] || '') !== (editData[campo] || '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1100px]" title={sol.tipo === 'delete' ? 'Exclusão' : 'Revisão de Alteração'}>
      <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-gray-200 text-sm">
        <div className="space-y-0.5">
          <p><strong>Profissional:</strong> {nomeProf}</p>
          <p><strong>Data:</strong> {new Date(sol.criado_em).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {sol.tipo === 'delete' ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-red-700 mb-2">Exclusão</h4>
          <p className="text-lg font-bold text-red-800 bg-red-100 inline-block px-4 py-1 rounded">{nomeProf}</p>
          <div className="mt-3 text-red-500 text-xs">Ação irreversível.</div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Campos com <span className="bg-yellow-200 px-1.5 py-0.5 rounded text-xs font-semibold">destaque amarelo</span> serão alterados.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-2 md:px-3 py-2 font-bold text-xs md:text-sm text-gray-700 border-b border-gray-200">Dados Atuais</div>
              <div className="divide-y divide-gray-100">
                {CAMPOS.map(campo => (
                  <div key={campo.key} className="flex items-start px-2 md:px-3 py-1.5 md:py-2 min-h-[28px] md:min-h-[32px]">
                    <span className="text-[10px] md:text-xs text-gray-500 w-20 md:w-28 shrink-0 pt-0.5">{campo.label}</span>
                    <span className="text-xs md:text-sm font-medium text-gray-800">{formatValor(campo.key, antigos[campo.key], unidades)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[var(--cor-primaria-claro)] px-2 md:px-3 py-2 font-bold text-xs md:text-sm text-[var(--cor-primaria)] border-b border-gray-200">Novos Dados</div>
              <div className="divide-y divide-gray-100">
                {CAMPOS.map(campo => {
                  const alterado = campoAlterado(campo.key);
                  const valorAtual = editData[campo.key] ?? '';
                  const valorAntigo = antigos[campo.key] ?? '';
                  if (campo.type === 'select') {
                    const options = getOptions(campo.key, unidades);
                    return (
                      <div key={campo.key} className={`flex items-start px-2 md:px-3 py-2 md:py-2.5 min-h-[32px] md:min-h-[36px] ${alterado ? 'bg-yellow-100 border-l-2 md:border-l-4 border-yellow-400' : ''}`} title={alterado ? `Original: ${valorAntigo || 'vazio'} → ${valorAtual || 'vazio'}` : ''}>
                        {alterado && <span className="text-yellow-600 mr-1 text-xs shrink-0 pt-1 font-bold" aria-hidden="true">⚠️</span>}
                        <span className="text-[10px] md:text-xs text-gray-500 w-16 md:w-24 shrink-0 pt-1">{campo.label}</span>
                        <select value={valorAtual} onChange={e => handleChange(campo.key, e.target.value)} className={`flex-1 text-xs md:text-sm border rounded px-1.5 md:px-2 py-1 ${alterado ? 'border-yellow-500 bg-yellow-50 font-bold' : 'border-gray-300'}`}>
                          <option value="">Selecione...</option>
                          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={campo.key} className={`flex items-start px-2 md:px-3 py-2 md:py-2.5 min-h-[32px] md:min-h-[36px] ${alterado ? 'bg-yellow-100 border-l-2 md:border-l-4 border-yellow-400' : ''}`} title={alterado ? `Original: ${valorAntigo || 'vazio'} → ${valorAtual || 'vazio'}` : ''}>
                      {alterado && <span className="text-yellow-600 mr-1 text-xs shrink-0 pt-1 font-bold" aria-hidden="true">⚠️</span>}
                      <span className="text-[10px] md:text-xs text-gray-500 w-16 md:w-24 shrink-0 pt-1">{campo.label}</span>
                      <input type="text" value={valorAtual} onChange={e => handleChange(campo.key, e.target.value)} className={`flex-1 text-xs md:text-sm border rounded px-1.5 md:px-2 py-1 ${alterado ? 'border-yellow-500 bg-yellow-50 font-bold' : 'border-gray-300'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: tabela simplificada com só os alterados */}
          <div className="block md:hidden mt-3">
            {CAMPOS.filter(campo => campoAlterado(campo.key)).length > 0 && (
              <details className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <summary className="text-[11px] font-bold text-yellow-800 cursor-pointer">
                  {CAMPOS.filter(campo => campoAlterado(campo.key)).length} campo(s) alterado(s) — clique para ver
                </summary>
                <div className="mt-2 space-y-1">
                  {CAMPOS.filter(campo => campoAlterado(campo.key)).map(campo => (
                    <div key={campo.key} className="text-[10px] flex flex-col gap-0.5 bg-white rounded p-1.5 border border-yellow-100">
                      <span className="font-bold text-gray-600">{campo.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 line-through">{antigos[campo.key] || 'vazio'}</span>
                        <span className="text-green-600 font-medium">→ {editData[campo.key] || 'vazio'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 md:gap-3 mt-5 pt-3 border-t border-gray-200 flex-wrap">
        <button onClick={onClose} disabled={processando} className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-none">Cancelar</button>
        <button onClick={handleRejeitar} disabled={processando} className="flex items-center justify-center gap-1.5 px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"><XCircle size={16} /> {processando ? '...' : 'Rejeitar'}</button>
        <button onClick={handleConfirmar} disabled={processando} className="flex items-center justify-center gap-1.5 px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"><CheckCircle size={16} /> {processando ? '...' : (sol.tipo === 'delete' ? 'Excluir' : 'Confirmar')}</button>
      </div>
    </Modal>
  );
}
