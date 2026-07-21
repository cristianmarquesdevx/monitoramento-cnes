import { useState } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { Mail, Send, AlertTriangle, CheckCircle, Copy, Pencil, X, Trash2, ClipboardList, Check } from 'lucide-react';

// ===== Múltiplos métodos de envio (fallback automático) =====
const EMAIL_API = '/api/send-email';  // Python SMTP (Vercel)

async function tentarEnviarPython(payload) {
  const res = await fetch(EMAIL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro SMTP');
  return data;
}

async function tentarEnviarBrevo(payload) {
  const { data, error } = await supabase.functions.invoke('enviar-email-relacionar', { body: payload });
  if (error) throw error;
  return data;
}

async function enviarComFallback(payload) {
  // Tenta Python SMTP primeiro. Se falhar, usa Brevo.
  try {
    return await tentarEnviarPython(payload);
  } catch (e) {
    console.warn('Python SMTP falhou, usando Brevo (fallback):', e.message);
    return await tentarEnviarBrevo(payload);
  }
}

export default function UnidadesSemCadastroModal({ isOpen, onClose, unidades, todasUnidades, onEmailSaved }) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [editandoEmail, setEditandoEmail] = useState(null);
  const [novoEmail, setNovoEmail] = useState('');
  const [showLote, setShowLote] = useState(false);
  const [loteText, setLoteText] = useState('');
  const [loteSalvando, setLoteSalvando] = useState(false);
  const [loteResultado, setLoteResultado] = useState(null);

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
      if (onEmailSaved) onEmailSaved();
    } catch (e) {
      toast.error('Erro ao salvar e-mail: ' + e.message);
    }
  };

  const handleLimparEmail = async (cnes) => {
    if (!await toast.confirm('Remover o e-mail cadastrado desta unidade?')) return;
    try {
      const { error } = await supabase
        .from('unidades_saude')
        .update({ email_responsavel: null })
        .eq('cnes', cnes);
      if (error) throw error;
      toast.success('E-mail removido com sucesso!');
      setEditandoEmail(null);
      setNovoEmail('');
      if (onEmailSaved) onEmailSaved();
    } catch (e) {
      toast.error('Erro ao remover e-mail: ' + e.message);
    }
  };

  const cancelarEdicao = () => {
    setEditandoEmail(null);
    setNovoEmail('');
  };

  const handleEnviarEmail = async (unidade) => {
    if (!unidade.email_responsavel) {
      toast.warning('Esta unidade não tem e-mail cadastrado.');
      return;
    }

    setEnviando(true);
    try {
      const data = await enviarComFallback({
        destinatario: unidade.email_responsavel,
        cnes: unidade.cnes,
        nome_unidade: unidade.nome_unidade,
        responsavel: unidade.responsavel || 'Gestor(a)',
        tipo: 'individual'
      });
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
      const data = await enviarComFallback({
        tipo: 'massivo',
        destinatarios: comEmail.map(u => ({
          destinatario: u.email_responsavel,
          cnes: u.cnes,
          nome_unidade: u.nome_unidade,
          responsavel: u.responsavel || 'Gestor(a)',
        }))
      });

      const { enviados, erros, total, detalhes } = data;
      setResultado({ enviados, erros, total });

      if (erros === 0) {
        toast.success(`${enviados} e-mail(s) enviado(s) com sucesso!`);
      } else {
        toast.success(`${enviados} de ${total} enviado(s).`);
        const falhas = detalhes.filter(d => !d.success);
        const resumoErros = falhas.map(f => `• ${f.nome_unidade}: ${f.error}`).join('\n');
        toast.warning(`${erros} falha(s):\n${resumoErros}`);
      }
    } catch (e) {
      toast.error('Erro no envio em massa: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setEnviando(false);
    }
  };

  const handlePreencherLote = async () => {
    // Formato esperado: cnes;email (um por linha)
    // Ou apenas: email (um por linha, na ordem da tabela)
    const linhas = loteText.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (linhas.length === 0) {
      toast.warning('Cole os e-mails primeiro.');
      return;
    }

    if (!await toast.confirm(`Preencher e-mail de ${Math.min(linhas.length, unidades.length)} unidade(s)?`)) return;

    setLoteSalvando(true);
    setLoteResultado(null);

    const resultados = [];
    let sucessos = 0;
    let erros = 0;

    for (let i = 0; i < linhas.length && i < unidades.length; i++) {
      const linha = linhas[i];
      const unidade = unidades[i];

      // Tenta parsear como "cnes;email" ou apenas "email"
      let email = '';
      let cnes = unidade.cnes;

      if (linha.includes(';')) {
        const partes = linha.split(';');
        const possivelCnes = partes[0].trim();
        const possivelEmail = partes.slice(1).join(';').trim();
        // Se o primeiro campo parece um CNES (só dígitos), usa como cnes
        if (/^\d+$/.test(possivelCnes) && possivelEmail.includes('@')) {
          cnes = possivelCnes;
          email = possivelEmail;
          // Verifica se o CNES existe no banco
          const existe = todasUnidades?.some(u => u.cnes === cnes);
          if (!existe) {
            erros++;
            resultados.push({ linha: i + 1, cnes, nome: `CNES ${cnes}`, success: false, error: 'CNES não encontrado' });
            continue;
          }
        } else if (possivelCnes.includes('@')) {
          email = possivelCnes;
        } else {
          email = possivelEmail || possivelCnes;
        }
      } else {
        email = linha;
      }

      if (!email.includes('@')) {
        erros++;
        resultados.push({ linha: i + 1, cnes, nome: unidade.nome_unidade, success: false, error: 'E-mail inválido' });
        continue;
      }

      try {
        const { error } = await supabase
          .from('unidades_saude')
          .update({ email_responsavel: email })
          .eq('cnes', cnes);
        if (error) throw error;
        sucessos++;
        resultados.push({ linha: i + 1, cnes, nome: unidade.nome_unidade, success: true, email });
      } catch (e) {
        erros++;
        resultados.push({ linha: i + 1, cnes, nome: unidade.nome_unidade, success: false, error: e.message });
      }
    }

    const ignorados = unidades.length - Math.min(linhas.length, unidades.length);
    const sobrando = linhas.length > unidades.length ? linhas.length - unidades.length : 0;

    setLoteResultado({ sucessos, erros, total: Math.min(linhas.length, unidades.length), detalhes: resultados, ignorados, sobrando });
    setLoteSalvando(false);

    if (erros === 0) {
      toast.success(`${sucessos} e-mail(s) preenchido(s) com sucesso!`);
    } else {
      toast.success(`${sucessos} de ${linhas.length} preenchido(s). ${erros} falha(s).`);
    }

    if (onEmailSaved) onEmailSaved();
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
        <button
          onClick={() => { setShowLote(!showLote); setLoteResultado(null); }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold cursor-pointer transition-all ${
            showLote
              ? 'bg-[var(--cor-primaria)] text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <ClipboardList size={14} />
          Preencher em Lote
        </button>

      </div>

      {/* Painel de preenchimento em lote */}
      {showLote && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ClipboardList size={14} />
              Preencher E-mails em Lote
            </h4>
            <span className="text-[10px] text-emerald-600">
              {unidades.length} unidade(s) na lista
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 mb-2 leading-relaxed">
            Cole os e-mails abaixo, <strong>um por linha</strong>, na mesma ordem da tabela.
            {' '}Ou use o formato <code className="bg-emerald-100 px-1 rounded">cnes;email</code> para associar pelo CNES.
          </p>
          <textarea
            value={loteText}
            onChange={e => setLoteText(e.target.value)}
            placeholder={unidades.slice(0, 3).map(u => `${u.cnes};email@exemplo.com`).join('\n') + '\n...'}
            className="w-full h-24 px-3 py-2 border border-emerald-300 rounded text-xs font-mono resize-y mb-2"
            disabled={loteSalvando}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreencherLote}
                disabled={loteSalvando || !loteText.trim()}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
              >
                {loteSalvando ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                ) : (
                  <><Check size={14} /> Aplicar</>
                )}
              </button>
              <button
                onClick={() => { setLoteText(''); setLoteResultado(null); }}
                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X size={12} /> Limpar
              </button>
            </div>
            <span className="text-[10px] text-gray-500">
              {loteText.trim().split('\n').map(l => l.trim()).filter(Boolean).length} linha(s) digitada(s)
            </span>
          </div>

          {/* Resultado do lote */}
          {loteResultado && (
            <div className="mt-2 border-t border-emerald-200 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                {loteResultado.erros === 0 ? (
                  <span className="text-green-700">✅ {loteResultado.sucessos} e-mail(s) salvos com sucesso!</span>
                ) : (
                  <span className="text-amber-700">⚠️ {loteResultado.sucessos} salvos, {loteResultado.erros} falha(s)</span>
                )}
              {loteResultado.ignorados > 0 && (
                <span className="text-orange-600 ml-2">
                  ⚠️ {loteResultado.ignorados} unidade(s) sem e-mail (faltou linha)
                </span>
              )}
              {loteResultado.sobrando > 0 && (
                <span className="text-orange-600 ml-2">
                  ⚠️ {loteResultado.sobrando} linha(s) ignorada(s) (excedeu unidades)
                </span>
              )}
              </div>
              {loteResultado.erros > 0 && (
                <div className="mt-1 max-h-[80px] overflow-y-auto">
                  {loteResultado.detalhes.filter(d => !d.success).map((d, i) => (
                    <div key={i} className="text-[10px] text-red-600 flex items-center gap-1">
                      <span>Linha {d.linha}:</span>
                      <span className="font-bold">{d.nome}</span>
                      <span className="text-red-400">— {d.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Mobile cards */}
      <div className="block md:hidden space-y-2 mb-4 max-h-[450px] overflow-y-auto">
        {(!unidades || unidades.length === 0) ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle size={24} className="inline mb-1 text-green-500" />
            <div className="font-semibold text-green-600">Todas as unidades possuem profissionais cadastrados!</div>
            <div className="text-xs text-gray-500 mt-1">Nenhuma unidade órfã encontrada.</div>
          </div>
        ) : unidades.map((u, i) => (
          <div key={u.cnes} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-gray-400">#{i + 1}</span>
              <button
                onClick={() => handleEnviarEmail(u)}
                disabled={enviando || !u.email_responsavel}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  u.email_responsavel
                    ? 'bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Mail size={10} />
                Enviar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-2">
              <div><span className="text-gray-500">CNES:</span> <span className="font-bold">{u.cnes}</span></div>
              <div><span className="text-gray-500">Unidade:</span> <span className="font-bold">{u.nome_unidade}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Responsável:</span> <span className="font-bold">{u.responsavel || <span className="text-gray-400 italic">Não informado</span>}</span></div>
            </div>
            <div className="border-t border-gray-100 pt-2">
              {editandoEmail === u.cnes ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={e => setNovoEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded text-xs"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSalvarEmail(u.cnes);
                      if (e.key === 'Escape') cancelarEdicao();
                    }}
                  />
                  <button
                    onClick={() => handleSalvarEmail(u.cnes)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all"
                  >
                    OK
                  </button>
                  <button
                    onClick={cancelarEdicao}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all"
                  >
                    <X size={12} />
                  </button>
                  {u.email_responsavel && (
                    <button
                      onClick={() => handleLimparEmail(u.cnes)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">E-mail:</span>
                  <span
                    className={`flex-1 cursor-pointer text-xs truncate ${
                      u.email_responsavel ? 'text-blue-600 underline hover:text-blue-800' : 'text-gray-400 italic hover:text-gray-600'
                    }`}
                    onClick={() => { setEditandoEmail(u.cnes); setNovoEmail(u.email_responsavel || ''); }}
                  >
                    {u.email_responsavel || 'Adicionar e-mail'}
                  </span>
                  <button
                    onClick={() => { setEditandoEmail(u.cnes); setNovoEmail(u.email_responsavel || ''); }}
                    className="text-gray-400 hover:text-[var(--cor-primaria)] p-1 rounded cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg max-h-[450px] overflow-y-auto">
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
                          if (e.key === 'Escape') cancelarEdicao();
                        }}
                      />
                      <button
                        onClick={() => handleSalvarEmail(u.cnes)}
                        className="bg-green-500 hover:bg-green-600 text-white px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-105"
                      >
                        OK
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-105"
                        title="Cancelar"
                      >
                        <X size={12} />
                      </button>
                      {u.email_responsavel && (
                        <button
                          onClick={() => handleLimparEmail(u.cnes)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-105"
                          title="Remover e-mail"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`cursor-pointer ${u.email_responsavel ? 'text-blue-600 underline hover:text-blue-800' : 'text-gray-400 italic hover:text-gray-600'}`}
                        onClick={() => { setEditandoEmail(u.cnes); setNovoEmail(u.email_responsavel || ''); }}
                        title="Clique para editar"
                      >
                        {u.email_responsavel || 'Adicionar e-mail'}
                      </span>
                      <button
                        onClick={() => { setEditandoEmail(u.cnes); setNovoEmail(u.email_responsavel || ''); }}
                        className="text-gray-400 hover:text-[var(--cor-primaria)] p-0.5 rounded cursor-pointer transition-all hover:scale-110"
                        title="Editar e-mail"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
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
