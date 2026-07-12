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

export default function ApprovalModal({ isOpen, onClose, solicitacao, unidades, profissionais, onComplete }) {
  const [editData, setEditData] = useState({});
  const [processando, setProcessando] = useState(false);

  const sol = solicitacao;
  const antigos = sol?.dados_antigos ?? EMPTY;
  const novos = sol?.dados_novos ?? EMPTY;

  useEffect(() => {
    if (sol) {
      setEditData({ ...novos });
    }
  }, [sol, novos]);

  if (!sol) return null;

  const prof = profissionais.find(p => p.id === sol.profissional_id);
  const nomeProf = prof?.nome_profissional || antigos.nome_profissional || `ID ${sol.profissional_id}`;

  const handleChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const handleRejeitar = async () => {
    if (!window.confirm(`Rejeitar esta solicitação de ${sol.tipo === 'update' ? 'alteração' : 'exclusão'} de "${nomeProf}"?`)) return;
    setProcessando(true);
    try {
      await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', sol.id);
      alert(`✅ Solicitação de ${sol.tipo === 'update' ? 'alteração' : 'exclusão'} rejeitada.`);
      onComplete?.();
      onClose();
    } catch (e) {
      alert('❌ Erro ao rejeitar: ' + e.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmar = async () => {
    if (sol.tipo === 'delete') {
      if (!window.confirm(`Deseja realmente EXCLUIR o profissional "${nomeProf}"?`)) return;
      setProcessando(true);
      try {
        await supabase.from('profissionais').delete().eq('id', sol.profissional_id);
        await supabase.from('solicitacoes').update({ status: 'aprovado', aprovado_em: new Date().toISOString() }).eq('id', sol.id);
        alert('✅ Exclusão aprovada e executada.');
        onComplete?.();
        onClose();
      } catch (e) {
        alert('❌ Erro ao excluir: ' + e.message);
      } finally {
        setProcessando(false);
      }
      return;
    }

    if (!window.confirm('Confirmar a alteração com os dados revisados?')) return;
    setProcessando(true);
    try {
      const { error } = await supabase
        .from('profissionais')
        .update(editData)
        .eq('id', sol.profissional_id);
      if (error) throw error;

      await supabase
        .from('solicitacoes')
        .update({ status: 'aprovado', aprovado_em: new Date().toISOString() })
        .eq('id', sol.id);

      alert('✅ Alteração aprovada e executada com sucesso.');
      onComplete?.();
      onClose();
    } catch (e) {
      alert('❌ Erro ao confirmar alteração: ' + e.message);
    } finally {
      setProcessando(false);
    }
  };

  const campoAlterado = (campo) => {
    if (sol.tipo === 'delete') return false;
    return (antigos[campo] || '') !== (editData[campo] || '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1100px]"
      title={sol.tipo === 'delete' ? 'Solicitação de Exclusão' : 'Revisão de Alteração'}
    >
      {/* Info header */}
      <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-gray-200 text-sm">
        <div className="space-y-0.5">
          <p><strong>Profissional:</strong> {nomeProf}</p>
          <p><strong>Data:</strong> {new Date(sol.criado_em).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500">ID da solicitação: {sol.id}</p>
        </div>
      </div>

      {sol.tipo === 'delete' ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-red-700 mb-2">Exclusão de Profissional</h4>
          <p className="text-red-600 mb-1">Você está prestes a <strong>excluir permanentemente</strong> os dados de:</p>
          <p className="text-lg font-bold text-red-800 bg-red-100 inline-block px-4 py-1 rounded">{nomeProf}</p>
          <div className="mt-3 text-red-500 text-xs">Esta ação não pode ser desfeita.</div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Revise os dados antes de confirmar a alteração. Campos com <span className="bg-yellow-200 px-1.5 py-0.5 rounded text-xs font-semibold">destaque amarelo</span> serão alterados.
          </p>

          {/* Side-by-side comparison — without scrollbars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Dados Atuais (read-only) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 font-bold text-sm text-gray-700 border-b border-gray-200">
                Dados Atuais
              </div>
              <div className="divide-y divide-gray-100">
                {CAMPOS.map(campo => (
                  <div key={campo.key} className="flex items-start px-3 py-2 min-h-[32px]">
                    <span className="text-xs text-gray-500 w-28 shrink-0 pt-0.5">{campo.label}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatValor(campo.key, antigos[campo.key], unidades)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Novos Dados (sempre editável) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[var(--cor-primaria-claro)] px-3 py-2 font-bold text-sm text-[var(--cor-primaria)] border-b border-gray-200">
                Novos Dados (editáveis)
              </div>
              <div className="divide-y divide-gray-100">
                {CAMPOS.map(campo => {
                  const alterado = campoAlterado(campo.key);
                  const valorAtual = editData[campo.key] ?? '';
                  const valorAntigo = antigos[campo.key] ?? '';

                  if (campo.type === 'select') {
                    const options = getOptions(campo.optionsKey, unidades);
                    return (
                      <div key={campo.key}
                        className={`flex items-start px-3 py-2.5 min-h-[36px] ${alterado ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}`}
                        title={alterado ? `Original: ${valorAntigo || 'vazio'} → Novo: ${valorAtual || 'vazio'}` : ''}>
                        {alterado && <span className="text-yellow-600 mr-1 text-xs shrink-0 pt-1 font-bold" aria-hidden="true" title="Campo alterado">⚠️</span>}
                        <span className="text-xs text-gray-500 w-24 shrink-0 pt-1">{campo.label}</span>
                        <select value={valorAtual} onChange={e => handleChange(campo.key, e.target.value)}
                          className={`flex-1 text-sm border rounded px-2 py-1 ${alterado ? 'border-yellow-500 bg-yellow-50 font-bold' : 'border-gray-300'}`}>
                          <option value="">Selecione...</option>
                          {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.text}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={campo.key}
                      className={`flex items-start px-3 py-2.5 min-h-[36px] ${alterado ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}`}
                      title={alterado ? `Original: ${valorAntigo || 'vazio'} → Novo: ${valorAtual || 'vazio'}` : ''}>
                      {alterado && <span className="text-yellow-600 mr-1 text-xs shrink-0 pt-1 font-bold" aria-hidden="true" title="Campo alterado">⚠️</span>}
                      <span className="text-xs text-gray-500 w-24 shrink-0 pt-1">{campo.label}</span>
                      <input type="text" value={valorAtual}
                        onChange={e => handleChange(campo.key, e.target.value)}
                        className={`flex-1 text-sm border rounded px-2 py-1 ${alterado ? 'border-yellow-500 bg-yellow-50 font-bold' : 'border-gray-300'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-gray-200">
        <button onClick={onClose} disabled={processando}
          className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50">
          Cancelar
        </button>
        <button onClick={handleRejeitar} disabled={processando}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50">
          <XCircle size={16} /> {processando ? 'Processando...' : 'Rejeitar'}
        </button>
        <button onClick={handleConfirmar} disabled={processando}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50">
          <CheckCircle size={16} /> {processando ? 'Processando...' : (sol.tipo === 'delete' ? 'Confirmar Exclusão' : 'Confirmar Alteração')}
        </button>
      </div>
    </Modal>
  );
}
