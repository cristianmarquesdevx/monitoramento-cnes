import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Trash2, AlertTriangle, MapPin, Briefcase, Clock, CheckCircle, Eye } from 'lucide-react';

export default function MultiLotacaoModal({ isOpen, onClose, multiLotacaoData, unidades, profissionais, onComplete }) {
  const { user } = useAuth();
  const toast = useToast();
  const [processando, setProcessando] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const totalProfissionais = multiLotacaoData?.length || 0;
  const totalVinculacoes = useMemo(() => {
    if (!multiLotacaoData) return 0;
    return multiLotacaoData.reduce((acc, g) => acc + g.profissionais.length, 0);
  }, [multiLotacaoData]);

  const getNomeUnidade = (cnes) => {
    const u = unidades?.find(uni => uni.cnes === cnes);
    return u ? `${u.cnes} - ${u.nome_unidade}` : cnes || '—';
  };

  const handleExcluirVinculo = async (profissional) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR o vínculo de "${profissional.nome_profissional}" na unidade ${getNomeUnidade(profissional.cnes)}?`)) return;

    setProcessando(profissional.id);
    try {
      await supabase.from('profissionais').delete().eq('id', profissional.id);

      try {
        await supabase.rpc('log_audit', {
          p_usuario_id: user?.id || '',
          p_usuario_nome: user?.email?.split('@')[0] || 'Sistema',
          p_acao: 'delete',
          p_tipo: 'profissional',
          p_target_id: String(profissional.id),
          p_descricao: `Removeu vínculo duplicado de "${profissional.nome_profissional}" (CPF: ${profissional.cpf}) na unidade ${getNomeUnidade(profissional.cnes)}`
        });
      } catch (e) { console.error('Erro ao registrar auditoria:', e.message); }

      toast.success(`Vínculo de "${profissional.nome_profissional}" removido com sucesso!`);
      onComplete?.();
    } catch (e) {
      toast.error('Erro ao excluir: ' + e.message);
    } finally {
      setProcessando(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1000px]" title={
      <div className="flex items-center gap-3">
        <Building2 size={22} className="text-[var(--cor-primaria)]" />
        <span>Profissionais com Múltiplas Lotações</span>
      </div>
    }>
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <span className="text-sm"><strong className="text-blue-700">{totalProfissionais}</strong> profissionais</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-purple-600" />
          <span className="text-sm"><strong className="text-purple-700">{totalVinculacoes}</strong> vínculos ativos</span>
        </div>
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold">
          <AlertTriangle size={14} />
          Média de {(totalVinculacoes / (totalProfissionais || 1)).toFixed(1)} vínculos por profissional
        </div>
      </div>

      {totalProfissionais === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
          <p className="font-semibold">Nenhum profissional com múltiplas lotações</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {multiLotacaoData.map((grupo, idx) => {
            const expandidoId = `${grupo.cpf}-${idx}`;
            const isExpanded = expandido === expandidoId;
            return (
              <div key={expandidoId} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                {/* Group header */}
                <button
                  onClick={() => setExpandido(isExpanded ? null : expandidoId)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-colors cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--cor-primaria)] text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-800">{grupo.nome}</p>
                      <p className="text-xs text-gray-500">CPF: {grupo.cpf || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                      <Building2 size={11} />
                      {grupo.unidades?.length || new Set(grupo.profissionais.map(p => p.cnes)).size} unidades
                    </span>
                    <Eye size={16} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {grupo.profissionais.map((prof) => {
                      const isProcessando = processando === prof.id;
                      const unidadesSet = new Set(grupo.profissionais.map(p => p.cnes));
                      const podeExcluir = unidadesSet.size > 1 || grupo.profissionais.length > 1;

                      return (
                        <div key={prof.id} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${isProcessando ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center gap-2 mb-1">
                              <Building2 size={13} className="text-[var(--cor-primaria)]" />
                              <span className="font-bold text-gray-700">
                                {getNomeUnidade(prof.cnes)}
                              </span>
                              {prof.cnes && (
                                <span className="text-gray-400">| CNES: {prof.cnes}</span>
                              )}
                              {prof.cns && (
                                <span className="text-gray-400">| CNS: {prof.cns}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Briefcase size={11} className="text-gray-400" />
                              <span>{prof.cargo_funcao || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">Vínculo:</span>
                              <span>{prof.tipo_vinculo || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock size={11} className="text-gray-400" />
                              <span>{prof.carga_horaria ? `${prof.carga_horaria}h` : '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">Setor:</span>
                              <span>{prof.setor_equipe || '—'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleExcluirVinculo(prof)}
                            disabled={isProcessando || !podeExcluir}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                              !podeExcluir
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isProcessando
                                ? 'bg-red-100 text-red-400'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200'
                            }`}
                            title={!podeExcluir ? 'Mantenha pelo menos um vínculo por unidade' : 'Excluir este vínculo'}
                          >
                            {isProcessando ? (
                              <span className="inline-block w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            {isProcessando ? 'Excluindo...' : 'Excluir vínculo'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
        <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
