import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, User, Trash2, Building2, Copy, CheckCircle, ShieldAlert, ChevronDown } from 'lucide-react';

export default function DuplicadosModal({ isOpen, onClose, duplicadosData, unidades, onComplete }) {
  const { user } = useAuth();
  const toast = useToast();
  const [processando, setProcessando] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const totalGrupos = duplicadosData?.length || 0;
  const totalDuplicados = useMemo(() => {
    if (!duplicadosData) return 0;
    return duplicadosData.reduce((acc, g) => acc + g.profissionais.length, 0);
  }, [duplicadosData]);

  const getNomeUnidade = (cnes) => {
    const u = unidades?.find(uni => uni.cnes === cnes);
    return u ? `${u.cnes} - ${u.nome_unidade}` : cnes || '—';
  };

  const handleExcluirVinculo = async (profissional, cpfGrupo) => {
    if (!window.confirm(
      `Tem certeza que deseja EXCLUIR o vínculo duplicado de "${profissional.nome_profissional}"?\n\n` +
      `CPF: ${profissional.cpf}\nUnidade: ${getNomeUnidade(profissional.cnes)}\n\n` +
      `Esta ação não pode ser desfeita.`
    )) return;

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
          p_descricao: `Removeu vínculo CPF duplicado de "${profissional.nome_profissional}" (CPF: ${profissional.cpf}) na unidade ${getNomeUnidade(profissional.cnes)}`
        });
      } catch (e) { console.error('Erro ao registrar auditoria:', e.message); }

      toast.success(`Vínculo duplicado de "${profissional.nome_profissional}" removido!`);
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
        <Copy size={22} className="text-red-500" />
        <span>Alertas - CPFs Duplicados</span>
      </div>
    }>
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-red-600" />
          <span className="text-sm"><strong className="text-red-700">{totalGrupos}</strong> CPFs duplicados</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={18} className="text-orange-600" />
          <span className="text-sm"><strong className="text-orange-700">{totalDuplicados}</strong> vínculos envolvidos</span>
        </div>
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">
          <AlertTriangle size={14} />
          {totalDuplicados - totalGrupos} vínculos excedentes
        </div>
      </div>

      {totalGrupos === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
          <p className="font-semibold">Nenhum CPF duplicado encontrado</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {duplicadosData.map((grupo, idx) => {
            const expandidoId = `${grupo.cpf}-${idx}`;
            const isExpanded = expandido === expandidoId;
            const manterId = grupo.profissionais[0]?.id;

            return (
              <div key={expandidoId} className="border border-red-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                {/* Group header */}
                <button
                  onClick={() => setExpandido(isExpanded ? null : expandidoId)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-white hover:from-red-100 hover:to-white transition-colors cursor-pointer border-b border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-800">
                        CPF: {grupo.cpf}
                      </p>
                      <p className="text-xs text-gray-500">
                        {grupo.profissionais.map(p => p.nome_profissional).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                      <Copy size={11} />
                      {grupo.profissionais.length} registros
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {grupo.profissionais.map((prof, pIdx) => {
                      const isProcessando = processando === prof.id;
                      const isPrimeiro = prof.id === manterId;
                      const podeExcluir = grupo.profissionais.length > 1;

                      return (
                        <div key={prof.id} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors
                          ${isProcessando ? 'opacity-50' : 'hover:bg-gray-50'}
                          ${isPrimeiro ? 'bg-green-50/50 border-l-4 border-l-green-400' : 'border-l-4 border-l-transparent'}`}
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center gap-2 mb-1">
                              {isPrimeiro && (
                                <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300">
                                  <CheckCircle size={10} /> Original
                                </span>
                              )}
                              <User size={13} className="text-gray-500" />
                              <span className="font-bold text-gray-700">{prof.nome_profissional || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Building2 size={11} className="text-gray-400" />
                              <span>{getNomeUnidade(prof.cnes)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">CNS:</span>
                              <span>{prof.cns || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">CBO:</span>
                              <span>{prof.cbo || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">Vínculo:</span>
                              <span>{prof.tipo_vinculo || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="text-gray-400">C.H.:</span>
                              <span>{prof.carga_horaria ? `${prof.carga_horaria}h` : '—'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isPrimeiro && (
                              <button
                                onClick={() => handleExcluirVinculo(prof, grupo.cpf)}
                                disabled={isProcessando || !podeExcluir}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  !podeExcluir
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isProcessando
                                    ? 'bg-red-100 text-red-400'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200'
                                }`}
                                title="Excluir este vínculo duplicado"
                              >
                                {isProcessando ? (
                                  <span className="inline-block w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                {isProcessando ? 'Excluindo...' : 'Excluir vínculo'}
                              </button>
                            )}
                            {isPrimeiro && (
                              <span className="text-[10px] text-green-600 font-semibold italic px-2">Registro mantido</span>
                            )}
                          </div>
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

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          <AlertTriangle size={11} className="inline mr-1" />
          O primeiro registro de cada CPF será mantido como original. Os demais podem ser removidos.
        </p>
        <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
