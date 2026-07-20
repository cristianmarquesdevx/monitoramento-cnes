import { useEffect, useState, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { listaCBO } from '../data/cboData';
import LoadingSkeleton from './Skeleton';
import KPICards from './KPICards';
import ProfessionalsTable from './ProfessionalsTable';
import TodayKPIs from './TodayKPIs';
import { Users, AlertTriangle, Clock, Download, FileText, Search, LogOut, CheckCheck, RefreshCw, BarChart3, UserCircle, Sun, Moon, Shield, History, Bell, Eye, Trash2, Fingerprint, BookOpen } from 'lucide-react';

const ChartsGrid = lazy(() => import('./ChartsGrid'));
const ApprovalModal = lazy(() => import('./ApprovalModal'));
const KpiDetailModal = lazy(() => import('./KpiDetailModal'));
const ReportsModal = lazy(() => import('./ReportsModal'));
const PrintFicha = lazy(() => import('./PrintFicha'));
const MultiLotacaoModal = lazy(() => import('./MultiLotacaoModal'));
const DuplicadosModal = lazy(() => import('./DuplicadosModal'));
const UnidadesSemCadastroModal = lazy(() => import('./UnidadesSemCadastroModal'));
const DocumentationModal = lazy(() => import('./DocumentationModal'));

export default function Dashboard({ onNavigate }) {
  const { unidades, profissionais, solicitacoes, loading, refreshData, recarregar, setProfissionais } = useData();
  const { user, profile, signOut, isEditor, isAdmin } = useAuth();
  const [unidadeFiltro, setUnidadeFiltro] = useState('__todos__');
  const [buscaUnidade, setBuscaUnidade] = useState('');
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todos');
  const [filtroControle, setFiltroControle] = useState('todos');
  const [tipoBusca, setTipoBusca] = useState('geral');
  const [solicitacaoModal, setSolicitacaoModal] = useState(null);
  const [kpiModal, setKpiModal] = useState(null);
  const [relatoriosModal, setRelatoriosModal] = useState(false);
  const [multiLotacaoModalOpen, setMultiLotacaoModalOpen] = useState(false);
  const [duplicadosModalOpen, setDuplicadosModalOpen] = useState(false);
  const [unidadesSemCadastroModalOpen, setUnidadesSemCadastroModalOpen] = useState(false);
  const [documentacaoModalOpen, setDocumentacaoModalOpen] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(50);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cnesDark') === 'true');
  const [notificacao, setNotificacao] = useState(null);
  const [periodoFiltro, setPeriodoFiltro] = useState('12');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [realtimeAtivo, setRealtimeAtivo] = useState(false);
  const [dataEmissao, setDataEmissao] = useState(() => new Date().toISOString().split('T')[0]);
  const buscaRef = useRef(null);

  // Resetar página quando filtros mudarem
  useEffect(() => { setPaginaAtual(1); }, [unidadeFiltro, buscaGlobal, filtroEspecialidade, filtroControle, filtroDataInicio, filtroDataFim, tipoBusca, itensPorPagina]);

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-300';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cnesDark', darkMode);
  }, [darkMode]);

  useEffect(() => { recarregar(); }, [recarregar]);

  // Realtime — APENAS notificação de solicitações novas, SEM refresh de dados
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitacoes' }, (payload) => {
        const tipo = payload.new?.tipo === 'update' ? 'Alteração' : payload.new?.tipo === 'delete' ? 'Exclusão' : 'Nova';
        setNotificacao({ msg: `Nova solicitação de ${tipo}`, tipo: 'info' });
        setTimeout(() => setNotificacao(null), 5000);
      })
      .subscribe((status) => {
        setRealtimeAtivo(status === 'SUBSCRIBED');
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Ctrl+K — foca na busca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statusConexao = 'Conectado';

  const nomeUsuario = profile?.nome || user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';
  const emailUsuario = user?.email || '';
  const roleLabel = profile?.role === 'admin' ? 'Administrador' : profile?.role === 'editor' ? 'Editor' : profile?.role === 'viewer' ? 'Visualizador' : '';
  const roleColors = { admin: 'bg-purple-100 text-purple-700 border-purple-300', editor: 'bg-blue-100 text-blue-700 border-blue-300', viewer: 'bg-gray-100 text-gray-600 border-gray-300' };
  const roleColor = roleColors[profile?.role] || roleColors.viewer;

  // Strip mask from CPF: remove dots, dashes, spaces
  const limparCPF = (valor) => (valor || '').replace(/[.\-\s]/g, '');

  // Filter profissionais by date range
  const profissionaisFiltrados = useMemo(() => {
    let lista = [...profissionais];
    if (unidadeFiltro !== '__todos__') lista = lista.filter(p => p.cnes === unidadeFiltro);
    if (buscaGlobal.trim()) {
      const q = buscaGlobal.toLowerCase().trim();
      const qLimpo = limparCPF(q);
      lista = lista.filter(p => {
        if (tipoBusca === 'cpf') {
          return limparCPF(p.cpf).includes(qLimpo);
        }
        if (tipoBusca === 'cns') {
          return (p.cns || '').includes(q);
        }
        // Search all fields (geral)
        return (
          (p.nome_profissional?.toLowerCase().includes(q)) ||
          limparCPF(p.cpf).includes(qLimpo) ||
          (p.cns || '').includes(q) ||
          (p.cbo && listaCBO.some(c => c.codigo === p.cbo && c.descricao.toLowerCase().includes(q))) ||
          (p.conselho?.toLowerCase().includes(q)) ||
          (p.cargo_funcao?.toLowerCase().includes(q)) ||
          (p.tipo_vinculo?.toLowerCase().includes(q)) ||
          (p.setor_equipe?.toLowerCase().includes(q))
        );
      });
    }
    if (filtroEspecialidade === 'medico') lista = lista.filter(p => p.cbo?.startsWith('2231'));
    else if (filtroEspecialidade === 'enfermeiro') lista = lista.filter(p => p.cbo?.startsWith('2235'));
    else if (filtroEspecialidade === 'dentista') lista = lista.filter(p => p.cbo?.startsWith('2232'));
    if (filtroControle === 'pendentes') lista = lista.filter(p => !p.controle_feito);
    else if (filtroControle === 'concluidos') lista = lista.filter(p => p.controle_feito);
    if (filtroDataInicio) lista = lista.filter(p => p.created_at >= filtroDataInicio);
    if (filtroDataFim) lista = lista.filter(p => p.created_at <= filtroDataFim + 'T23:59:59');
    return lista;
  }, [profissionais, unidadeFiltro, buscaGlobal, filtroEspecialidade, filtroControle, filtroDataInicio, filtroDataFim]);

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(profissionaisFiltrados.length / itensPorPagina));
  const paginaAtualSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaAtualSegura - 1) * itensPorPagina;
  const paginaAtualData = profissionaisFiltrados.slice(inicio, inicio + itensPorPagina);

  // Unidades sem nenhum profissional cadastrado
  const unidadesSemCadastro = useMemo(() => {
    const cnesComProf = new Set(profissionais.map(p => p.cnes));
    return unidades.filter(u => !cnesComProf.has(u.cnes));
  }, [unidades, profissionais]);

  const kpis = useMemo(() => {
    const total = profissionais.length;
    const medicos = profissionais.filter(p => p.cbo?.startsWith('2231')).length;
    const enfermeiros = profissionais.filter(p => p.cbo?.startsWith('2235')).length;
    const acs = profissionais.filter(p => p.cbo === '5151-05').length;
    const dentistas = profissionais.filter(p => p.cbo?.startsWith('2232')).length;
    const cbos = new Set(profissionais.map(p => p.cbo)).size;
    const h = new Date().toISOString().split('T')[0];
    const criadosHoje = profissionais.filter(p => p.created_at?.startsWith(h)).length;
    const semCBO = profissionais.filter(p => !p.cbo).length;
    const semCPF = profissionais.filter(p => !p.cpf).length;
    const completude = total > 0 ? Math.round(((total - semCBO - semCPF) / total) * 100) : 0;
    const pendentes = solicitacoes.length;
    const concluidos = profissionais.filter(p => p.controle_feito).length;
    return { total, unidades: unidades.length, medicos, enfermeiros, acs, dentistas, cbos, criadosHoje, alertas: semCBO + semCPF, completude, pendentes, concluidos };
  }, [profissionais, unidades, solicitacoes]);

  const todayStats = useMemo(() => {
    const h = new Date().toISOString().split('T')[0];
    return {
      inclusoesHoje: profissionais.filter(p => p.created_at?.startsWith(h)).length,
      alteracoesHoje: solicitacoes.filter(s => s.tipo === 'update' && s.criado_em?.startsWith(h)).length,
      exclusoesHoje: solicitacoes.filter(s => s.tipo === 'delete' && s.criado_em?.startsWith(h)).length,
      pendentesHoje: solicitacoes.filter(s => s.status === 'pendente' && s.criado_em?.startsWith(h)).length,
      aprovadosHoje: solicitacoes.filter(s => s.status === 'aprovado' && s.aprovado_em?.startsWith(h)).length,
      alertasCriticos: profissionais.filter(p => !p.cbo).length + profissionais.filter(p => !p.cpf).length,
    };
  }, [profissionais, solicitacoes]);

  const handleTodayKpiClick = useCallback((kpiKey) => {
    const h = new Date().toISOString().split('T')[0];
    let lista = [], titulo = '';
    switch (kpiKey) {
      case 'inclusoesHoje': lista = profissionais.filter(p => p.created_at?.startsWith(h)); titulo = `Inclusões Hoje (${lista.length})`; break;
      case 'alteracoesHoje': const aS = solicitacoes.filter(s => s.tipo === 'update' && s.criado_em?.startsWith(h)); lista = profissionais.filter(p => aS.some(s => s.profissional_id === p.id)); titulo = `Alterações Hoje (${aS.length})`; break;
      case 'exclusoesHoje': const eS = solicitacoes.filter(s => s.tipo === 'delete' && s.criado_em?.startsWith(h)); lista = profissionais.filter(p => eS.some(s => s.profissional_id === p.id)); titulo = `Exclusões Hoje (${eS.length})`; break;
      case 'pendentesHoje': const pS = solicitacoes.filter(s => s.status === 'pendente' && s.criado_em?.startsWith(h)); lista = profissionais.filter(p => pS.some(s => s.profissional_id === p.id)); titulo = `Pendentes Hoje (${pS.length})`; break;
      case 'aprovadosHoje': const rS = solicitacoes.filter(s => s.status === 'aprovado' && s.aprovado_em?.startsWith(h)); lista = profissionais.filter(p => rS.some(s => s.profissional_id === p.id)); titulo = `Aprovados Hoje (${rS.length})`; break;
      case 'alertasCriticos': lista = profissionais.filter(p => !p.cbo || !p.cpf); titulo = `Alertas Críticos (${lista.length})`; break;
      default: return;
    }
    setKpiModal({ titulo, lista });
  }, [profissionais, solicitacoes]);

  const handleKpiClick = useCallback((kpiKey) => {
    const h = new Date().toISOString().split('T')[0];
    let lista = [], titulo = '';
    switch (kpiKey) {
      case 'total': lista = profissionais; titulo = `Todos (${lista.length})`; break;
      case 'medicos': lista = profissionais.filter(p => p.cbo?.startsWith('2231')); titulo = `Médicos (${lista.length})`; break;
      case 'enfermeiros': lista = profissionais.filter(p => p.cbo?.startsWith('2235')); titulo = `Enfermeiros (${lista.length})`; break;
      case 'acs': lista = profissionais.filter(p => p.cbo === '5151-05'); titulo = `ACS (${lista.length})`; break;
      case 'dentistas': lista = profissionais.filter(p => p.cbo?.startsWith('2232')); titulo = `Dentistas (${lista.length})`; break;
      case 'criadosHoje': lista = profissionais.filter(p => p.created_at?.startsWith(h)); titulo = `Cadastrados Hoje (${lista.length})`; break;
      case 'alertas': lista = profissionais.filter(p => !p.cbo || !p.cpf); titulo = `Alertas (${lista.length})`; break;
      case 'pendentes': setKpiModal(null); return;
      case 'concluidos': lista = profissionais.filter(p => p.controle_feito); titulo = `Concluídos (${lista.length})`; break;
      default: return;
    }
    setKpiModal({ titulo, lista });
  }, [profissionais]);

  const unidadeSelecionada = unidadeFiltro !== '__todos__' ? unidades.find(u => u.cnes === unidadeFiltro) : null;
  const unidadeOptions = useMemo(() => unidades.filter(u => !buscaUnidade || u.nome_unidade.toLowerCase().includes(buscaUnidade.toLowerCase()) || u.cnes?.includes(buscaUnidade)), [unidades, buscaUnidade]);

  useEffect(() => {
    if (!buscaUnidade.trim()) { setUnidadeFiltro('__todos__'); return; }
    const q = buscaUnidade.trim().toLowerCase();
    const match = unidades.find(u => u.cnes?.toLowerCase() === q || u.nome_unidade?.toLowerCase() === q);
    if (match && unidadeFiltro !== match.cnes) setUnidadeFiltro(match.cnes);
  }, [buscaUnidade, unidades, unidadeFiltro]);

  const marcarConcluido = async (id, concluido) => {
    // ═══ MARCA NA HORA E NUNCA REVERTE ═══
    // O usuário disse: "uma vez marcada, não pode desmarcar mais"
    setProfissionais(prev => prev.map(p =>
      p.id === id ? { ...p, controle_feito: concluido } : p
    ));

    // Tenta salvar no Supabase, mas se falhar, o checkbox CONTINUA MARCADO
    try {
      await supabase.from('profissionais').update({ controle_feito: concluido }).eq('id', id);
    } catch (e) {
      console.error('Erro ao salvar (checkbox continua marcado):', e.message);
    }

    // Auditoria separada — erro não afeta o checkbox
    if (concluido) {
      try {
        await supabase.rpc('log_audit', {
          p_usuario_id: user.id,
          p_usuario_nome: nomeUsuario,
          p_acao: 'controle',
          p_tipo: 'profissional',
          p_target_id: String(id),
          p_descricao: `Marcou profissional ${id} como concluído`
        });
      } catch (e) {
        console.error('Erro ao registrar auditoria (não crítico):', e.message);
      }
    }
  };

  const marcarTodosConcluidos = async () => {
    try {
      const results = await Promise.allSettled(
        profissionaisFiltrados.map(p =>
          supabase.from('profissionais').update({ controle_feito: true }).eq('id', p.id)
        )
      );
      // Atualiza todos que tiveram sucesso
      const falhas = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          setProfissionais(prev => prev.map(pp =>
            pp.id === profissionaisFiltrados[i].id ? { ...pp, controle_feito: true } : pp
          ));
        } else {
          falhas.push(profissionaisFiltrados[i].id);
        }
      });
      if (falhas.length > 0) {
        console.error('Falhas ao marcar:', falhas.length);
      }
    } catch (e) { console.error('Erro:', e.message); }
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'CPF', 'CNS', 'CBO', 'Conselho', 'Registro', 'UF', 'Cargo', 'Vínculo', 'C.H.', 'Setor', 'Unidade'];
    const rows = profissionaisFiltrados.map(p => [p.nome_profissional, p.cpf, p.cns, p.cbo, p.conselho, p.registro, p.uf_conselho, p.cargo_funcao, p.tipo_vinculo, p.carga_horaria, p.setor_equipe, unidades.find(u => u.cnes === p.cnes)?.nome_unidade || p.cnes].map(v => `"${v || ''}"`).join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'profissionais.csv'; link.click();
  };

  // Charts data with period filter
  const chartMensal = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const numMeses = parseInt(periodoFiltro) || 12;
    const startMonth = new Date();
    startMonth.setMonth(startMonth.getMonth() - numMeses);
    const data = meses.map(m => ({ mes: m, inclusoes: 0, alteracoes: 0, exclusoes: 0 }));
    profissionais.forEach(p => {
      if (p.created_at) {
        const d = new Date(p.created_at);
        if (d >= startMonth) data[d.getMonth()].inclusoes++;
      }
    });
    // Count alterações and exclusões from solicitacoes
    solicitacoes.forEach(s => {
      if (s.criado_em) {
        const d = new Date(s.criado_em);
        if (d >= startMonth) {
          if (s.tipo === 'update') data[d.getMonth()].alteracoes++;
          else if (s.tipo === 'delete') data[d.getMonth()].exclusoes++;
        }
      }
    });
    return data;
  }, [profissionais, solicitacoes, periodoFiltro]);

  const chartCBO = useMemo(() => {
    const count = {};
    profissionais.forEach(p => { if (p.cbo) { const c = listaCBO.find(c => c.codigo === p.cbo); const n = c ? c.descricao.split(' - ')[0] : p.cbo; count[n] = (count[n] || 0) + 1; } });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [profissionais]);

  const chartCarga = useMemo(() => {
    const ranges = { '20h': 0, '30h': 0, '40h': 0, 'Outros': 0 };
    profissionais.forEach(p => { const ch = parseInt(p.carga_horaria); if (ch <= 20) ranges['20h']++; else if (ch <= 30) ranges['30h']++; else if (ch <= 40) ranges['40h']++; else ranges['Outros']++; });
    return Object.entries(ranges).map(([carga, valor]) => ({ carga, valor }));
  }, [profissionais]);

  const alertas = useMemo(() => {
    const alerts = [];
    const semCBO = profissionais.filter(p => !p.cbo), semCPF = profissionais.filter(p => !p.cpf), semUnidade = profissionais.filter(p => !p.cnes);
    const cpfMap = {}; profissionais.forEach(p => { if (p.cpf) { if (!cpfMap[p.cpf]) cpfMap[p.cpf] = []; cpfMap[p.cpf].push(p); } });
    const duplicados = []; Object.values(cpfMap).forEach(g => { if (g.length > 1) duplicados.push(...g); });
    if (semCBO.length) alerts.push({ type: 'warning', msg: `${semCBO.length} profissionais sem CBO`, count: semCBO.length });
    if (semCPF.length) alerts.push({ type: 'warning', msg: `${semCPF.length} profissionais sem CPF`, count: semCPF.length });
    if (semUnidade.length) alerts.push({ type: 'warning', msg: `${semUnidade.length} sem unidade`, count: semUnidade.length });
    if (duplicados.length) alerts.push({ type: 'critical', msg: `${duplicados.length} CPF duplicado`, count: duplicados.length });
    return alerts;
  }, [profissionais]);

  const multiLotacao = useMemo(() => {
    const count = {};
    profissionais.forEach(p => { if (p.cpf) { if (!count[p.cpf]) count[p.cpf] = { nome: p.nome_profissional, unidades: new Set() }; count[p.cpf].unidades.add(p.cnes); } });
    return Object.values(count).filter(v => v.unidades.size > 1).sort((a, b) => b.unidades.size - a.unidades.size).slice(0, 15);
  }, [profissionais]);

  const multiLotacaoData = useMemo(() => {
    const cpfMap = {};
    profissionais.forEach(p => {
      if (p.cpf) {
        if (!cpfMap[p.cpf]) cpfMap[p.cpf] = [];
        cpfMap[p.cpf].push(p);
      }
    });
    return Object.values(cpfMap)
      .filter(group => { const unidades = new Set(group.map(p => p.cnes)); return unidades.size > 1; })
      .map(group => ({
        nome: group[0].nome_profissional,
        cpf: group[0].cpf,
        profissionais: group,
        unidades: [...new Set(group.map(p => p.cnes))]
      }));
  }, [profissionais]);

  const duplicadosData = useMemo(() => {
    const cpfMap = {};
    profissionais.forEach(p => {
      if (p.cpf) {
        if (!cpfMap[p.cpf]) cpfMap[p.cpf] = [];
        cpfMap[p.cpf].push(p);
      }
    });
    return Object.values(cpfMap).filter(group => group.length > 1).map(group => ({
      cpf: group[0].cpf,
      profissionais: group
    }));
  }, [profissionais]);

  const getCboDesc = (codigo) => listaCBO.find(c => c.codigo === codigo)?.descricao || codigo || '';
  const handleAprovacaoCompleta = () => { setSolicitacaoModal(null); refreshData(); };

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Realtime notification toast */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-[9999] bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-[toastSlideIn_0.35s_ease-out] text-sm font-bold">
          <Bell size={16} /> {notificacao.msg}
        </div>
      )}

      {/* Header */}
      <div className={`${cardBg} border-b-2 border-[var(--cor-primaria)] transition-colors`}>
        <div className="flex items-center justify-between px-3 md:px-4 py-2.5 flex-wrap gap-2.5">
          <img src="/logo_prefeitura.png" alt="Prefeitura" className="h-[40px] md:h-[55px]" loading="lazy" />
          <div className="flex-1 text-center min-w-[180px] md:min-w-[200px]">
            <h2 className={`text-[var(--cor-primaria)] text-[clamp(12px,2.5vw,18px)] font-bold leading-tight`}>PREFEITURA DO MUNICÍPIO DE PORTO VELHO</h2>
            <h3 className={`text-[var(--cor-primaria)] text-[clamp(10px,1.8vw,14px)]`}>SECRETARIA MUNICIPAL DE SAÚDE – SEMUSA</h3>
            <h3 className={`text-[var(--cor-primaria)] text-[clamp(10px,1.8vw,14px)]`}>DIVISÃO DE CONTROLE E AVALIAÇÃO DO SUS</h3>
          </div>
          <img src="/logo_cnes.png" alt="CNES" className="h-[40px] md:h-[55px]" loading="lazy" />
        </div>
        <div className="bg-[var(--cor-primaria)] text-white text-center py-2 px-3 font-bold text-[clamp(13px,2.5vw,17px)]">
          PLANILHA DE ATUALIZAÇÃO CADASTRAL DOS PROFISSIONAIS – CNES
        </div>
        <div className={`flex flex-wrap items-center justify-center md:justify-between px-3 md:px-4 py-2 border-t ${borderColor} text-[clamp(10px,1.6vw,13px)] gap-2 transition-colors`}>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <UserCircle size={16} className="text-[var(--cor-primaria)]" />
            <span className={`font-semibold ${textColor} truncate max-w-[100px] md:max-w-[160px]`}>{nomeUsuario}</span>
            <span className="text-gray-400 hidden sm:inline">&bull;</span>
            <span className={`${mutedText} hidden sm:inline text-[11px] truncate max-w-[80px] md:max-w-none`}>{emailUsuario}</span>
            {roleLabel && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleColor}`}>{roleLabel}</span>}
            {isAdmin && (
              <button onClick={() => onNavigate?.('admin')} className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 cursor-pointer" title="Admin">
                <Shield size={14} />
              </button>
            )}
            <button onClick={() => onNavigate?.('audit')} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 cursor-pointer" title="Auditoria">
              <History size={14} />
            </button>
            <button onClick={() => setDocumentacaoModalOpen(true)} className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 cursor-pointer" title="Documentação Técnica">
              <BookOpen size={14} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-1 rounded cursor-pointer ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`} title={darkMode ? 'Modo claro' : 'Modo escuro'}>
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          <input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className="w-auto max-w-[150px] border border-gray-300 rounded px-2 py-1 text-xs md:text-sm" />
          <div className={`flex items-center gap-1.5 font-bold text-xs md:text-sm px-2 md:px-3 py-1 rounded-full ${cardBg} border-2 ${borderColor}`}>
            <span className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full inline-block ${realtimeAtivo ? 'bg-green-500 shadow-[0_0_6px_#28a745]' : 'bg-red-500 shadow-[0_0_6px_#dc3545]'}`} />
            <span className={textColor}>{statusConexao}</span>
            {realtimeAtivo && <RefreshCw size={12} className="animate-spin text-yellow-500" />}
          </div>
          <button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 md:px-4 py-1 text-[11px] md:text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer"><LogOut size={11} /> Sair</button>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-50 px-3 md:px-4 py-3 border-b-2 border-[var(--cor-primaria)]"><LoadingSkeleton /></div>
      ) : (
      <>
      {/* KPIs */}
      <div className={`${bgColor} px-3 md:px-4 py-3 border-b-2 border-[var(--cor-primaria)]`}>
        <KPICards kpis={kpis} onKpiClick={handleKpiClick} />
        <TodayKPIs stats={todayStats} onKpiClick={handleTodayKpiClick} />
        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-md p-3 border border-gray-300 h-[200px] animate-pulse"><div className="h-3.5 w-28 bg-gray-200 rounded mb-2" /><div className="h-[85%] flex items-end gap-1.5 px-2 pb-2">{Array.from({ length: 8 }).map((_, j) => <div key={j} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${[60,75,45,80,55,70,50,65][j % 8]}%` }} />)}</div></div>
        ))}</div>}>
          <ChartsGrid chartMensal={chartMensal} chartCBO={chartCBO} chartCarga={chartCarga} darkMode={darkMode} />
        </Suspense>

        {/* Period filter */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold ${textColor}`}>Período:</span>
          <select value={periodoFiltro} onChange={e => setPeriodoFiltro(e.target.value)} className={`text-xs px-2 py-1 border ${borderColor} rounded ${cardBg} ${textColor}`}>
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Últimos 12 meses</option>
            <option value="24">Últimos 24 meses</option>
          </select>
          <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} className={`text-xs px-2 py-1 border ${borderColor} rounded ${cardBg} ${textColor}`} />
          <span className={mutedText}>até</span>
          <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} className={`text-xs px-2 py-1 border ${borderColor} rounded ${cardBg} ${textColor}`} />
        </div>

        {multiLotacao.length > 0 && (
          <div className={`${cardBg} rounded-md p-2.5 border ${borderColor} mb-2 max-h-[200px] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-1">
              <h5 className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><Users size={12} className="inline mr-1" /> Profissionais com múltiplas lotações</h5>
              <button
                onClick={() => setMultiLotacaoModalOpen(true)}
                className="inline-flex items-center gap-1 bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer hover:scale-105 shadow-sm"
                title="Ver detalhes e gerenciar vínculos"
              >
                <Eye size={11} />
                Ver Detalhes
              </button>
            </div>
            <ul className="space-y-0.5">{multiLotacao.map((p, i) => (
              <li key={i} className={`flex justify-between text-xs py-0.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <span className={textColor}>{p.nome}</span>
                <span className="bg-[var(--cor-primaria)] text-white px-2 py-0.5 rounded-full text-[10px]">{p.unidades.size} unidades</span>
              </li>
            ))}</ul>
          </div>
        )}

        <div className={`${cardBg} rounded-md p-2.5 border ${borderColor} mb-2`}>
          <h5 className={`text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><AlertTriangle size={12} className="inline mr-1" /> Alertas</h5>
          {alertas.length === 0 ? <div className={mutedText + ' text-xs'}>Nenhum alerta.</div> : alertas.map((a, i) => (
            <div key={i} className={`text-xs py-1 px-2 mb-0.5 border-l-4 flex items-center justify-between gap-2 ${a.type === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-400 bg-yellow-50'}`}>
              <span>{a.msg}</span>
              {a.msg?.includes('CPF duplicado') && (
                <button
                  onClick={() => setDuplicadosModalOpen(true)}
                  className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer hover:scale-105 shrink-0 shadow-sm"
                  title="Gerenciar vínculos duplicados"
                >
                  <Trash2 size={10} />
                  Gerenciar
                </button>
              )}
            </div>
          ))}
        </div>

        {solicitacoes.length > 0 && (
          <div className={`${cardBg} rounded-md p-2.5 border ${borderColor} max-h-[180px] overflow-y-auto`}>
            <h5 className={`text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><Clock size={12} className="inline mr-1" /> Solicitações Pendentes</h5>
            {solicitacoes.map(sol => {
              const prof = profissionais.find(p => p.id === sol.profissional_id);
              return (
                <div key={sol.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs py-1.5 border-b border-gray-100 gap-1">
                  <span className="flex-1"><strong>{sol.tipo === 'update' ? 'Alteração' : 'Exclusão'}</strong> - {prof?.nome_profissional || sol.dados_antigos?.nome_profissional || `ID ${sol.profissional_id}`} <span className="text-gray-500">{new Date(sol.criado_em).toLocaleString()}</span></span>
                  <div className="flex gap-1 self-end sm:self-auto">
                    {isEditor ? (<><button onClick={() => setSolicitacaoModal(sol)} className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-0.5 text-[10px] font-bold cursor-pointer">Aprovar</button>
                    <button onClick={async () => { if (window.confirm(`Rejeitar?`)) { await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', sol.id); refreshData(); } }} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-0.5 text-[10px] font-bold cursor-pointer">Rejeitar</button></>) : (<span className="text-gray-400 text-[10px] italic">Apenas admin/editor</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unit Selector */}
      <div className={`flex flex-wrap items-center gap-2 px-3 md:px-4 py-2.5 ${bgColor} border-b ${borderColor}`}>
        <label className={`font-bold text-xs md:text-sm ${textColor}`}>Unidade:</label>
        <input type="text" value={buscaUnidade} onChange={e => setBuscaUnidade(e.target.value)} placeholder="🔍 Buscar..." className={`flex-1 min-w-[140px] md:min-w-[200px] px-2 py-1.5 border ${borderColor} rounded text-xs md:text-sm ${cardBg} ${textColor}`} />
        <select value={unidadeFiltro} onChange={e => setUnidadeFiltro(e.target.value)} className={`flex-1 min-w-[180px] md:min-w-[250px] px-2 py-1.5 border ${borderColor} rounded text-xs md:text-sm ${cardBg} ${textColor}`}>
          <option value="__todos__">Todas as unidades</option>
          {unidadeOptions.map(u => <option key={u.cnes} value={u.cnes}>{u.cnes} - {u.nome_unidade}</option>)}
        </select>
        <button onClick={() => recarregar()} className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><Search size={14} /> Filtrar</button>
        <button onClick={() => setRelatoriosModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><BarChart3 size={14} /> Rel.</button>
        <button onClick={() => window.print()} className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><FileText size={14} /> PDF</button>
        <button onClick={exportarCSV} className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><Download size={14} /> CSV</button>
      </div>

      {/* Global Search */}
      <div className={`flex flex-wrap items-center gap-2 px-3 md:px-4 py-2.5 ${bgColor} border-b ${borderColor}`}>
        <div className="flex items-center gap-1">
          <Fingerprint size={14} className={`${mutedText}`} />
          <select value={tipoBusca} onChange={e => setTipoBusca(e.target.value)} className={`px-2 py-2 border ${borderColor} rounded text-xs md:text-sm font-bold ${cardBg} ${textColor} cursor-pointer`}>
            <option value="geral">Geral</option>
            <option value="cpf">CPF</option>
            <option value="cns">CNS</option>
          </select>
        </div>
        <input ref={buscaRef} type="text" value={buscaGlobal} onChange={e => setBuscaGlobal(e.target.value)}
          placeholder={tipoBusca === 'cpf' ? '🔍 Buscar por CPF (11 dígitos)' : tipoBusca === 'cns' ? '🔍 Buscar por CNS (15 dígitos)' : '🔍 Buscar por nome, CPF, CNS, CBO...'}
          maxLength={tipoBusca === 'cpf' ? 14 : tipoBusca === 'cns' ? 15 : undefined}
          className={`flex-1 min-w-[180px] md:min-w-[200px] px-2 md:px-3 py-2 border ${borderColor} rounded text-xs md:text-sm ${cardBg} ${textColor}`} />
        <select value={filtroEspecialidade} onChange={e => setFiltroEspecialidade(e.target.value)} className={`min-w-[110px] md:min-w-[130px] px-2 py-2 border ${borderColor} rounded text-xs md:text-sm ${cardBg} ${textColor}`}>
          <option value="todos">Todos</option>
          <option value="medico">Médico</option><option value="enfermeiro">Enfermeiro</option><option value="dentista">Dentista</option>
        </select>
        <select value={filtroControle} onChange={e => setFiltroControle(e.target.value)} className={`min-w-[120px] md:min-w-[140px] px-2 py-2 border ${borderColor} rounded text-xs md:text-sm ${cardBg} ${textColor}`}>
          <option value="todos">Todos</option>
          <option value="pendentes">Pendentes</option>
          <option value="concluidos">Concluídos</option>
        </select>
        <span className={`text-xs md:text-sm ${mutedText}`}>{loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded" /> : `${profissionaisFiltrados.length} encontrados`}</span>
        {isEditor && <button onClick={marcarTodosConcluidos} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-bold text-[11px] md:text-xs flex items-center gap-1.5 cursor-pointer"><CheckCheck size={14} /> Concluir</button>}
        <button onClick={() => setUnidadesSemCadastroModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-bold text-[11px] md:text-xs flex items-center gap-1.5 cursor-pointer">
          <Users size={14} /> Relacionar
        </button>
      </div>

      <div className="bg-[var(--cor-primaria)] text-white px-3 md:px-4 py-1 font-bold text-xs md:text-sm">1. DADOS DA UNIDADE</div>
      <div className={`flex flex-wrap items-center gap-4 md:gap-8 px-3 md:px-5 py-3 ${bgColor} border-b-2 border-[var(--cor-primaria)]`}>
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-bold text-[var(--cor-primaria)]">CNES:</span>
          <span className="font-bold text-base md:text-lg text-[var(--cor-primaria)] bg-gray-200 px-2 md:px-3 py-1 rounded border-2 border-[var(--cor-primaria)]">{unidadeSelecionada?.cnes || '--'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-bold text-[var(--cor-primaria)]">Unidade:</span>
          <span className="font-bold text-base md:text-lg text-[var(--cor-primaria)] bg-gray-200 px-2 md:px-3 py-1 rounded border-2 border-[var(--cor-primaria)]">{unidadeSelecionada?.nome_unidade || '--'}</span>
        </div>
      </div>

      <div className="bg-[var(--cor-primaria)] text-white px-3 md:px-4 py-1 font-bold text-xs md:text-sm">2. RELAÇÃO DOS PROFISSIONAIS</div>
      <ProfessionalsTable profissionaisFiltrados={paginaAtualData} onMarcarConcluido={marcarConcluido} getCboDesc={getCboDesc} paginaAtual={paginaAtualSegura} />

      {/* Pagination Controls */}
      <div className={`flex items-center justify-center gap-1.5 px-3 md:px-4 py-3 ${bgColor} border-t ${borderColor} flex-wrap`}>
        <div className="flex items-center gap-1.5 mr-3">
          <span className={`text-xs ${mutedText}`}>Por página:</span>
          <select value={itensPorPagina} onChange={e => setItensPorPagina(Number(e.target.value))}
            className={`text-xs px-1.5 py-1 border ${borderColor} rounded ${cardBg} ${textColor} cursor-pointer`}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {totalPaginas > 1 && (
          <>
          <button
            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
            disabled={paginaAtualSegura <= 1}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${paginaAtualSegura <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--cor-primaria)] hover:text-white'} ${cardBg} ${textColor} border ${borderColor}`}
          >
            « Anterior
          </button>
          {(() => {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, paginaAtualSegura - Math.floor(maxVisible / 2));
            let end = Math.min(totalPaginas, start + maxVisible - 1);
            if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
            if (start > 1) pages.push(1);
            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPaginas - 1) pages.push('...');
            if (end < totalPaginas) pages.push(totalPaginas);
            return pages.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className={`px-2 text-xs ${mutedText}`}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPaginaAtual(p)}
                  className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
                    p === paginaAtualSegura
                      ? 'bg-[var(--cor-primaria)] text-white'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-[var(--cor-primaria)] hover:text-white`
                  }`}
                >
                  {p}
                </button>
              )
            );
          })()}
          <button
            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtualSegura >= totalPaginas}
            className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${paginaAtualSegura >= totalPaginas ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--cor-primaria)] hover:text-white'} ${cardBg} ${textColor} border ${borderColor}`}
          >
            Próximo »
          </button>
          </>
        )}
        <span className={`text-xs ${mutedText} ml-2`}>
          Página {paginaAtualSegura} de {totalPaginas} ({profissionaisFiltrados.length} registros)
        </span>
      </div>

      <div className={`mt-auto ${bgColor} border-t-2 border-[var(--cor-primaria)] px-3 md:px-5 py-4 text-center text-[11px] md:text-xs ${textColor}`}>
        <p className="my-0.5">Desenvolvido por Cristian Marques</p>
        <p className="my-0.5">SEMUSA - Secretaria Municipal de Saúde de Porto Velho</p>
        <p className={`text-[10px] md:text-[11px] ${mutedText}`}>&copy; 2026 - Todos os direitos reservados</p>
      </div>
      </>
      )}

      <Suspense fallback={null}>
        <ReportsModal isOpen={relatoriosModal} onClose={() => setRelatoriosModal(false)} profissionais={profissionais} unidades={unidades} solicitacoes={solicitacoes} />
      </Suspense>
      <Suspense fallback={null}>
        <KpiDetailModal isOpen={!!kpiModal} onClose={() => setKpiModal(null)} titulo={kpiModal?.titulo || ''} profissionais={kpiModal?.lista || []} unidades={unidades} />
      </Suspense>
      <Suspense fallback={null}>
        <ApprovalModal isOpen={!!solicitacaoModal} onClose={() => setSolicitacaoModal(null)} solicitacao={solicitacaoModal} unidades={unidades} profissionais={profissionais} currentUser={{ id: user?.id, nome: nomeUsuario }} onComplete={handleAprovacaoCompleta} />
      </Suspense>
      {profissionaisFiltrados.length > 0 && (
        <Suspense fallback={null}>
          <PrintFicha profissionais={profissionaisFiltrados} unidade={unidadeSelecionada} dataEmissao={dataEmissao} getCboDesc={getCboDesc} />
        </Suspense>
      )}
        <Suspense fallback={null}>
          <MultiLotacaoModal
            isOpen={multiLotacaoModalOpen}
            onClose={() => setMultiLotacaoModalOpen(false)}
            multiLotacaoData={multiLotacaoData}
            unidades={unidades}
            profissionais={profissionais}
            onComplete={() => refreshData()}
          />
        </Suspense>
        <Suspense fallback={null}>
          <DuplicadosModal
            isOpen={duplicadosModalOpen}
            onClose={() => setDuplicadosModalOpen(false)}
            duplicadosData={duplicadosData}
            unidades={unidades}
            onComplete={() => refreshData()}
          />
        </Suspense>
        <Suspense fallback={null}>
          <UnidadesSemCadastroModal
            isOpen={unidadesSemCadastroModalOpen}
            onClose={() => setUnidadesSemCadastroModalOpen(false)}
            unidades={unidadesSemCadastro}
            todasUnidades={unidades}
          />
        </Suspense>
        <Suspense fallback={null}>
          <DocumentationModal
            isOpen={documentacaoModalOpen}
            onClose={() => setDocumentacaoModalOpen(false)}
          />
        </Suspense>
    </div>
  );
}
