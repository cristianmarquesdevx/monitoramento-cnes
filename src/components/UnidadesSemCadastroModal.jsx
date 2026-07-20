import { useState } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { Mail, Send, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

export default function UnidadesSemCadastroModal({ isOpen, onClose, unidades, todasUnidades }) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [editandoEmail, setEditandoEmail] = useState(null);
  const [novoEmail, setNovoEmail] = useState('');

  const totalUnidades = todasUnidades?.length || 0;
  const comProfissionais = totalUnidades - (unidades?.length || 0);

  const handleSalvarEmail = async (cnes) => {
    if (!novoEmail || !novoEmail.includes('@')) {
      toast.warning('Informe um e-mail válido.');
      return;
    }
    try {
      const { error } = await supabase
        .from('unidades_saude')
        .update({ email_responsavel: novoEmail })
        .eq('cnes', cnes);
      if (error) throw error;
      toast.success('E-mail salvo com sucesso!');
      setEditandoEmail(null);
      setNovoEmail('');
    } catch (e) {
      toast.error('Erro ao salvar e-mail: ' + e.message);
    }
  };

  const handleEnviarEmail = async (unidade) => {
    if (!unidade.email_responsavel) {
      toast.warning('Esta unidade não tem e-mail cadastrado.');
      return;
    }

    setEnviando(true);
    try {
      // Tenta chamar a Edge Function (se existir)
      const { data, error } = await supabase.functions.invoke('enviar-email-relacionar', {
        body: {
          destinatario: unidade.email_responsavel,
          cnes: unidade.cnes,
          nome_unidade: unidade.nome_unidade,
          responsavel: unidade.responsavel || 'Gestor(a)',
          tipo: 'individual'
        }
      });
      if (error) throw error;
      toast.success(`E-mail enviado para ${unidade.email_responsavel}`);
      setResultado(prev => ({ ...prev, enviados: (prev?.enviados || 0) + 1 }));
    } catch (e) {
      const msg = e.message || 'Erro desconhecido';
      toast.error('Falha ao enviar e-mail: ' + msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarTodos = async () => {
    const comEmail = unidades.filter(u => u.email_responsavel);
    if (comEmail.length === 0) {
      toast.warning('Nenhuma unidade com e-mail cadastrado.');
      return;
    }

    if (!await toast.confirm(`Enviar e-mail para ${comEmail.length} unidade(s)?`)) return;

    setEnviando(true);

    try {
      // ➡️ 1 chamada única para a Edge Function com todos os destinatários
      const { data, error } = await supabase.functions.invoke('enviar-email-relacionar', {
        body: {
          tipo: 'massivo',
          destinatarios: comEmail.map(u => ({
            destinatario: u.email_responsavel,
            cnes: u.cnes,
            nome_unidade: u.nome_unidade,
            responsavel: u.responsavel || 'Gestor(a)',
          }))
        }
      });

      if (error) throw error;

      const { enviados, erros, total, detalhes } = data;
      setResultado({ enviados, erros, total });

      if (erros === 0) {
        toast.success(`${enviados} e-mail(s) enviado(s) com sucesso!`);
      } else {
        toast.success(`${enviados} de ${total} enviado(s).`);
        const falhas = detalhes.filter(d => !d.success);
        // Agrupa todos os erros em um único toast
        const resumoErros = falhas.map(f => `• ${f.nome_unidade}: ${f.error}`).join('\n');
        toast.warning(`${erros} falha(s):\n${resumoErros}`);
      }
    } catch (e) {
      toast.error('Erro no envio em massa: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setEnviando(false);
    }
  };

  const copiarLista = async () => {
    const texto = unidades.map(u =>
      `${u.cnes} - ${u.nome_unidade}${u.responsavel ? ` | Responsável: ${u.responsavel}` : ''}${u.email_responsavel ? ` | E-mail: ${u.email_responsavel}` : ''}`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('Lista copiada para a área de transferência!');
    } catch (e) {
      // Fallback para navegadores sem permissão clipboard
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Lista copiada!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔗 Unidades sem Profissionais Cadastrados" maxWidth="max-w-[1000px]">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{unidades?.length || 0}</div>
          <div className="text-xs font-semibold text-red-700">Unidades sem cadastro</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{comProfissionais}</div>
          <div className="text-xs font-semibold text-green-700">Unidades com cadastro</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalUnidades}</div>
          <div className="text-xs font-semibold text-blue-700">Total de unidades</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={handleEnviarTodos}
          disabled={enviando}
          className="inline-flex items-center gap-1.5 bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-4 py-2 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
        >
          <Send size={14} />
          {enviando ? 'Enviando...' : 'Enviar E-mail para Todos'}
        </button>
        <button
          onClick={copiarLista}
          className="inline-flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-xs font-bold cursor-pointer transition-all"
        >
          <Copy size={14} />
          Copiar Lista
        </button>

      </div>

      {/* Results */}
      {resultado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800">
            {resultado.enviados} de {resultado.total} e-mail(s) enviados
            {resultado.erros > 0 && ` (${resultado.erros} falhas)`}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[450px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--cor-primaria-claro)] text-center text-xs font-bold uppercase text-gray-700">
              <th className="border border-gray-300 px-2 py-2 w-10">#</th>
              <th className="border border-gray-300 px-2 py-2">CNES</th>
              <th className="border border-gray-300 px-2 py-2">Unidade</th>
              <th className="border border-gray-300 px-2 py-2">Responsável</th>
              <th className="border border-gray-300 px-2 py-2">E-mail</th>
              <th className="border border-gray-300 px-2 py-2 w-[120px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!unidades || unidades.length === 0) ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  <AlertTriangle size={24} className="inline mb-1 text-green-500" />
                  <div className="font-semibold text-green-600">Todas as unidades possuem profissionais cadastrados!</div>
                  <div className="text-xs text-gray-500 mt-1">Nenhuma unidade órfã encontrada.</div>
                </td>
              </tr>
            ) : unidades.map((u, i) => (
              <tr key={u.cnes} className="hover:bg-gray-50 border-b border-gray-200 even:bg-gray-50/50">
                <td className="border border-gray-200 px-2 py-1.5 text-center text-xs text-gray-400">{i + 1}</td>
                <td className="border border-gray-200 px-2 py-1.5 text-center text-xs font-bold">{u.cnes}</td>
                <td className="border border-gray-200 px-2 py-1.5 text-xs font-bold">{u.nome_unidade}</td>
                <td className="border border-gray-200 px-2 py-1.5 text-center text-xs">
                  {u.responsavel || (
                    <span className="text-gray-400 italic">Não informado</span>
                  )}
                </td>
                <td className="border border-gray-200 px-2 py-1.5 text-center text-xs">
                  {editandoEmail === u.cnes ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="email"
                        value={novoEmail}
                        onChange={e => setNovoEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full px-1.5 py-1 border border-gray-300 rounded text-xs"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSalvarEmail(u.cnes);
                          if (e.key === 'Escape') setEditandoEmail(null);
                        }}
                      />
                      <button
                        onClick={() => handleSalvarEmail(u.cnes)}
                        className="bg-green-500 hover:bg-green-600 text-white px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`cursor-pointer ${u.email_responsavel ? 'text-blue-600 underline' : 'text-gray-400 italic'}`}
                      onClick={() => { setEditandoEmail(u.cnes); setNovoEmail(u.email_responsavel || ''); }}
                      title="Clique para editar"
                    >
                      {u.email_responsavel || 'Adicionar e-mail'}
                    </span>
                  )}
                </td>
                <td className="border border-gray-200 px-2 py-1.5 text-center">
                  <button
                    onClick={() => handleEnviarEmail(u)}
                    disabled={enviando || !u.email_responsavel}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      u.email_responsavel
                        ? 'bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    title={u.email_responsavel ? 'Enviar e-mail para esta unidade' : 'Cadastre um e-mail primeiro'}
                  >
                    <Mail size={10} />
                    Enviar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>




    </Modal>
  );
}
