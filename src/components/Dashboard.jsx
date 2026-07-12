import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { listaCBO } from '../data/cboData';
import LoadingSkeleton from './Skeleton';
import KPICards from './KPICards';
import ProfessionalsTable from './ProfessionalsTable';
import TodayKPIs from './TodayKPIs';
import { Users, AlertTriangle, Clock, Download, FileText, Search, LogOut, CheckCheck, RefreshCw, BarChart3, UserCircle } from 'lucide-react';

// Lazy-loaded components (code-splitting)
const ChartsGrid = lazy(() => import('./ChartsGrid'));
const ApprovalModal = lazy(() => import('./ApprovalModal'));
const KpiDetailModal = lazy(() => import('./KpiDetailModal'));
const ReportsModal = lazy(() => import('./ReportsModal'));
const PrintFicha = lazy(() => import('./PrintFicha'));

export default function Dashboard() {
  const { unidades, profissionais, solicitacoes, loading, recarregar } = useData();
  const { user, signOut } = useAuth();
  const [unidadeFiltro, setUnidadeFiltro] = useState('__todos__');
  const [buscaUnidade, setBuscaUnidade] = useState('');
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todos');
  const [filtroControle, setFiltroControle] = useState('todos');
  const [solicitacaoModal, setSolicitacaoModal] = useState(null);
  const [kpiModal, setKpiModal] = useState(null);
  const [relatoriosModal, setRelatoriosModal] = useState(false);
  // Load data on mount
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const hoje = new Date().toISOString().split('T')[0];
  const [dataEmissao, setDataEmissao] = useState(hoje);
  const statusConexao = 'Conectado';
  const [realtimeAtivo, setRealtimeAtivo] = useState(false);

  // User display name
  const nomeUsuario = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';
  const emailUsuario = user?.email || '';

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profissionais' }, () => recarregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'unidades_saude' }, () => recarregar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitacoes' }, () => recarregar())
      .subscribe((status) => {
        setRealtimeAtivo(status === 'SUBSCRIBED');
      });
    return () => { supabase.removeChannel(channel); };
  }, [recarregar]);

  const profissionaisFiltrados = useMemo(() => {
    let lista = [...profissionais];
    if (unidadeFiltro !== '__todos__') {
      lista = lista.filter(p => p.cnes === unidadeFiltro);
    }
    if (buscaGlobal.trim()) {
      const q = buscaGlobal.toLowerCase().trim();
      lista = lista.filter(p =>
        (p.nome_profissional && p.nome_profissional.toLowerCase().includes(q)) ||
        (p.cpf && p.cpf.includes(q)) ||
        (p.cbo && listaCBO.some(c => c.codigo === p.cbo && c.descricao.toLowerCase().includes(q)))
      );
    }
    if (filtroEspecialidade === 'medico') lista = lista.filter(p => p.cbo?.startsWith('2231'));
    else if (filtroEspecialidade === 'enfermeiro') lista = lista.filter(p => p.cbo?.startsWith('2235'));
    else if (filtroEspecialidade === 'dentista') lista = lista.filter(p => p.cbo?.startsWith('2232'));
    if (filtroControle === 'pendentes') lista = lista.filter(p => !p.controle_concluido);
    else if (filtroControle === 'concluidos') lista = lista.filter(p => p.controle_concluido);
    return lista;
  }, [profissionais, unidadeFiltro, buscaGlobal, filtroEspecialidade, filtroControle]);

  const kpis = useMemo(() => {
    const total = profissionais.length;
    const medicos = profissionais.filter(p => p.cbo?.startsWith('2231')).length;
    const enfermeiros = profissionais.filter(p => p.cbo?.startsWith('2235')).length;
    const acs = profissionais.filter(p => p.cbo === '5151-05').length;
    const dentistas = profissionais.filter(p => p.cbo?.startsWith('2232')).length;
    const cbos = new Set(profissionais.map(p => p.cbo)).size;
    const hoje = new Date().toISOString().split('T')[0];
    const criadosHoje = profissionais.filter(p => p.created_at?.startsWith(hoje)).length;
    const semCBO = profissionais.filter(p => !p.cbo).length;
    const semCPF = profissionais.filter(p => !p.cpf).length;
    const completude = total > 0 ? Math.round(((total - semCBO - semCPF) / total) * 100) : 0;
    const pendentes = solicitacoes.length;
    const concluidos = profissionais.filter(p => p.controle_concluido).length;
    return { total, unidades: unidades.length, medicos, enfermeiros, acs, dentistas, cbos, criadosHoje, alertas: semCBO + semCPF, completude, pendentes, concluidos };
  }, [profissionais, unidades, solicitacoes]);

  // Today's activity stats
  const todayStats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const inclusoesHoje = profissionais.filter(p => p.created_at?.startsWith(hoje)).length;
    const alteracoesHoje = solicitacoes.filter(s => s.tipo === 'update' && s.criado_em?.startsWith(hoje)).length;
    const exclusoesHoje = solicitacoes.filter(s => s.tipo === 'delete' && s.criado_em?.startsWith(hoje)).length;
    const pendentesHoje = solicitacoes.filter(s => s.status === 'pendente' && s.criado_em?.startsWith(hoje)).length;
    const aprovadosHoje = solicitacoes.filter(s => s.status === 'aprovado' && s.aprovado_em?.startsWith(hoje)).length;
    const alertasCriticos = profissionais.filter(p => !p.cbo).length + profissionais.filter(p => !p.cpf).length;
    return { inclusoesHoje, alteracoesHoje, exclusoesHoje, pendentesHoje, aprovadosHoje, alertasCriticos };
  }, [profissionais, solicitacoes]);

  // Today KPI click handler
  const handleTodayKpiClick = useCallback((kpiKey) => {
    const hoje = new Date().toISOString().split('T')[0];
    let lista = [];
    let titulo = '';

    switch (kpiKey) {
      case 'inclusoesHoje':
        lista = profissionais.filter(p => p.created_at?.startsWith(hoje));
        titulo = `Inclusões Hoje (${lista.length})`;
        break;
      case 'alteracoesHoje':
        const altSol = solicitacoes.filter(s => s.tipo === 'update' && s.criado_em?.startsWith(hoje));
        lista = profissionais.filter(p => altSol.some(s => s.profissional_id === p.id));
        titulo = `Alterações Hoje (${altSol.length} solicitações)`;
        break;
      case 'exclusoesHoje':
        const excSol = solicitacoes.filter(s => s.tipo === 'delete' && s.criado_em?.startsWith(hoje));
        lista = profissionais.filter(p => excSol.some(s => s.profissional_id === p.id));
        titulo = `Exclusões Hoje (${excSol.length} solicitações)`;
        break;
      case 'pendentesHoje':
        const penSol = solicitacoes.filter(s => s.status === 'pendente' && s.criado_em?.startsWith(hoje));
        lista = profissionais.filter(p => penSol.some(s => s.profissional_id === p.id));
        titulo = `Pendentes Hoje (${penSol.length} solicitações)`;
        break;
      case 'aprovadosHoje':
        const aprSol = solicitacoes.filter(s => s.status === 'aprovado' && s.aprovado_em?.startsWith(hoje));
        lista = profissionais.filter(p => aprSol.some(s => s.profissional_id === p.id));
        titulo = `Aprovados Hoje (${aprSol.length} solicitações)`;
        break;
      case 'alertasCriticos':
        lista = profissionais.filter(p => !p.cbo || !p.cpf);
        titulo = `Alertas Críticos (${lista.length})`;
        break;
      default:
        return;
    }
    setKpiModal({ titulo, lista });
  }, [profissionais, solicitacoes]);

  // KPI click handler
  const handleKpiClick = useCallback((kpiKey) => {
    const hoje = new Date().toISOString().split('T')[0];
    let lista = [];
    let titulo = '';

    switch (kpiKey) {
      case 'total':
        lista = profissionais;
        titulo = `Todos os Profissionais (${profissionais.length})`;
        break;
      case 'medicos':
        lista = profissionais.filter(p => p.cbo?.startsWith('2231'));
        titulo = `Médicos (${lista.length})`;
        break;
      case 'enfermeiros':
        lista = profissionais.filter(p => p.cbo?.startsWith('2235'));
        titulo = `Enfermeiros (${lista.length})`;
        break;
      case 'acs':
        lista = profissionais.filter(p => p.cbo === '5151-05');
        titulo = `ACS - Agentes Comunitários de Saúde (${lista.length})`;
        break;
      case 'dentistas':
        lista = profissionais.filter(p => p.cbo?.startsWith('2232'));
        titulo = `Dentistas (${lista.length})`;
        break;
      case 'criadosHoje':
        lista = profissionais.filter(p => p.created_at?.startsWith(hoje));
        titulo = `Cadastrados Hoje (${lista.length})`;
        break;
      case 'alertas':
        lista = profissionais.filter(p => !p.cbo || !p.cpf);
        titulo = `Profissionais com Alertas (${lista.length})`;
        break;
      case 'pendentes':
        titulo = `Solicitações Pendentes (${solicitacoes.length})`;
        setKpiModal(null);
        return;
      case 'concluidos':
        lista = profissionais.filter(p => p.controle_concluido);
        titulo = `Controle Concluído (${lista.length})`;
        break;
      default:
        return;
    }
    setKpiModal({ titulo, lista });
  }, [profissionais, solicitacoes]);

  const unidadeSelecionada = unidadeFiltro !== '__todos__' ? unidades.find(u => u.cnes === unidadeFiltro) : null;

  const unidadeOptions = useMemo(() => {
    return unidades.filter(u => !buscaUnidade || u.nome_unidade.toLowerCase().includes(buscaUnidade.toLowerCase()) || u.cnes?.includes(buscaUnidade));
  }, [unidades, buscaUnidade]);

  // Auto-select unit when search matches exactly
  useEffect(() => {
    if (!buscaUnidade.trim()) {
      setUnidadeFiltro('__todos__');
      return;
    }
    const q = buscaUnidade.trim().toLowerCase();
    const match = unidades.find(u =>
      u.cnes?.toLowerCase() === q ||
      u.nome_unidade?.toLowerCase() === q
    );
    if (match && unidadeFiltro !== match.cnes) {
      setUnidadeFiltro(match.cnes);
    }
  }, [buscaUnidade, unidades, unidadeFiltro]);

  const marcarConcluido = async (id, concluido) => {
    try {
      const { error } = await supabase.from('profissionais').update({ controle_concluido: concluido }).eq('id', id);
      if (error) throw error;
      recarregar();
    } catch (e) {
      console.error('Erro ao marcar como concluído:', e.message);
    }
  };

  const marcarTodosConcluidos = async () => {
    try {
      for (const p of profissionaisFiltrados) {
        const { error } = await supabase.from('profissionais').update({ controle_concluido: true }).eq('id', p.id);
        if (error) throw error;
      }
      recarregar();
    } catch (e) {
      console.error('Erro ao marcar todos:', e.message);
    }
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'CPF', 'CBO', 'Conselho', 'Registro', 'UF', 'Cargo', 'Vínculo', 'C.H.', 'Setor', 'Unidade'];
    const rows = profissionaisFiltrados.map(p => [
      p.nome_profissional, p.cpf, p.cbo, p.conselho, p.registro, p.uf_conselho,
      p.cargo_funcao, p.tipo_vinculo, p.carga_horaria, p.setor_equipe,
      unidades.find(u => u.cnes === p.cnes)?.nome_unidade || p.cnes
    ].map(v => `"${v || ''}"`).join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'profissionais.csv'; link.click();
  };

  // Charts data
  const chartMensal = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = meses.map(m => ({ mes: m, inclusoes: 0, alteracoes: 0, exclusoes: 0 }));
    profissionais.forEach(p => {
      if (p.created_at) {
        const m = new Date(p.created_at).getMonth();
        data[m].inclusoes++;
      }
    });
    return data;
  }, [profissionais]);

  const chartCBO = useMemo(() => {
    const count = {};
    profissionais.forEach(p => {
      if (p.cbo) {
        const cbo = listaCBO.find(c => c.codigo === p.cbo);
        const nome = cbo ? cbo.descricao.split(' - ')[0] : p.cbo;
        count[nome] = (count[nome] || 0) + 1;
      }
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [profissionais]);

  const chartCarga = useMemo(() => {
    const ranges = { '20h': 0, '30h': 0, '40h': 0, 'Outros': 0 };
    profissionais.forEach(p => {
      const ch = parseInt(p.carga_horaria);
      if (ch <= 20) ranges['20h']++;
      else if (ch <= 30) ranges['30h']++;
      else if (ch <= 40) ranges['40h']++;
      else ranges['Outros']++;
    });
    return Object.entries(ranges).map(([carga, valor]) => ({ carga, valor }));
  }, [profissionais]);

  // Alerts
  const alertas = useMemo(() => {
    const alerts = [];
    const semCBO = profissionais.filter(p => !p.cbo);
    const semCPF = profissionais.filter(p => !p.cpf);
    const semUnidade = profissionais.filter(p => !p.cnes);
    const duplicados = [];
    const cpfMap = {};
    profissionais.forEach(p => {
      if (p.cpf) {
        if (!cpfMap[p.cpf]) cpfMap[p.cpf] = [];
        cpfMap[p.cpf].push(p);
      }
    });
    Object.values(cpfMap).forEach(g => { if (g.length > 1) duplicados.push(...g); });
    if (semCBO.length) alerts.push({ type: 'warning', msg: `${semCBO.length} profissionais sem CBO`, count: semCBO.length });
    if (semCPF.length) alerts.push({ type: 'warning', msg: `${semCPF.length} profissionais sem CPF`, count: semCPF.length });
    if (semUnidade.length) alerts.push({ type: 'warning', msg: `${semUnidade.length} profissionais sem unidade`, count: semUnidade.length });
    if (duplicados.length) alerts.push({ type: 'critical', msg: `${duplicados.length} profissionais com CPF duplicado`, count: duplicados.length });
    return alerts;
  }, [profissionais]);

  // Multi-lotacao
  const multiLotacao = useMemo(() => {
    const count = {};
    profissionais.forEach(p => {
      if (p.cpf) {
        if (!count[p.cpf]) count[p.cpf] = { nome: p.nome_profissional, unidades: new Set() };
        count[p.cpf].unidades.add(p.cnes);
      }
    });
    return Object.values(count).filter(v => v.unidades.size > 1).sort((a, b) => b.unidades.size - a.unidades.size).slice(0, 15);
  }, [profissionais]);

  const getCboDesc = (codigo) => listaCBO.find(c => c.codigo === codigo)?.descricao || codigo || '';

  const handleAprovacaoCompleta = () => {
    setSolicitacaoModal(null);
    recarregar();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-[var(--cor-primaria)]">
        <div className="flex items-center justify-between px-3 md:px-4 py-2.5 flex-wrap gap-2.5">
          <img src="/logo_prefeitura.png" alt="Prefeitura" className="h-[40px] md:h-[55px]" />
          <div className="flex-1 text-center min-w-[180px] md:min-w-[200px]">
            <h2 className="text-[var(--cor-primaria)] text-[clamp(12px,2.5vw,18px)] font-bold leading-tight">PREFEITURA DO MUNICÍPIO DE PORTO VELHO</h2>
            <h3 className="text-[var(--cor-primaria)] text-[clamp(10px,1.8vw,14px)]">SECRETARIA MUNICIPAL DE SAÚDE – SEMUSA</h3>
            <h3 className="text-[var(--cor-primaria)] text-[clamp(10px,1.8vw,14px)]">DIVISÃO DE CONTROLE E AVALIAÇÃO DO SUS</h3>
          </div>
          <img src="/logo_cnes.png" alt="CNES" className="h-[40px] md:h-[55px]" />
        </div>
        <div className="bg-[var(--cor-primaria)] text-white text-center py-2 px-3 font-bold text-[clamp(13px,2.5vw,17px)]">
          PLANILHA DE ATUALIZAÇÃO CADASTRAL DOS PROFISSIONAIS – CNES
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-between px-3 md:px-4 py-2 border-t border-gray-300 text-[clamp(10px,1.6vw,13px)] gap-2">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <UserCircle size={16} className="text-[var(--cor-primaria)]" />
            <span className="font-semibold text-gray-700 truncate max-w-[120px] md:max-w-none">{nomeUsuario}</span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-500 hidden sm:inline text-[11px]">{emailUsuario}</span>
          </div>
          <input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)}
            className="w-auto max-w-[150px] border border-gray-300 rounded px-2 py-1 text-xs md:text-sm" />
          <div className="flex items-center gap-1.5 font-bold text-xs md:text-sm px-2 md:px-3 py-1 rounded-full bg-gray-100 border-2 border-gray-300">
            <span className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full inline-block ${realtimeAtivo ? 'bg-green-500 shadow-[0_0_6px_#28a745]' : 'bg-red-500 shadow-[0_0_6px_#dc3545]'}`} />
            <span>{statusConexao}</span>
            {realtimeAtivo && <RefreshCw size={12} className="animate-spin text-yellow-500" />}
          </div>
          <button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 md:px-4 py-1 text-[11px] md:text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer">
            <LogOut size={11} /> Sair
          </button>
        </div>
      </div>

      {/* Main Content - Skeleton while loading */}
      {loading ? (
        <div className="bg-gray-50 px-3 md:px-4 py-3 border-b-2 border-[var(--cor-primaria)]">
          <LoadingSkeleton />
        </div>
      ) : (
      <>
      {/* KPIs */}
      <div className="bg-gray-50 px-3 md:px-4 py-3 border-b-2 border-[var(--cor-primaria)]">
        <KPICards kpis={kpis} onKpiClick={handleKpiClick} />
        <TodayKPIs stats={todayStats} onKpiClick={handleTodayKpiClick} />
        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-md p-3 border border-gray-300 h-[200px] animate-pulse">
            <div className="h-3.5 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-[85%] flex items-end gap-1.5 px-2 pb-2">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${[60,75,45,80,55,70,50,65][j % 8]}%` }} />
              ))}
            </div>
          </div>
        ))}</div>}>
          <ChartsGrid chartMensal={chartMensal} chartCBO={chartCBO} chartCarga={chartCarga} />
        </Suspense>

        {/* Multi-lotação */}
        {multiLotacao.length > 0 && (
          <div className="bg-white rounded-md p-2.5 border border-gray-300 mb-2 max-h-[160px] overflow-y-auto">
            <h5 className="text-xs font-bold mb-1 text-gray-600"><Users size={12} className="inline mr-1" /> Profissionais com múltiplas lotações</h5>
            <ul className="space-y-0.5">{multiLotacao.map((p, i) => (
              <li key={i} className="flex justify-between text-xs py-0.5 border-b border-gray-100">
                <span>{p.nome}</span>
                <span className="bg-[var(--cor-primaria)] text-white px-2 py-0.5 rounded-full text-[10px]">{p.unidades.size} unidades</span>
              </li>
            ))}</ul>
          </div>
        )}

        {/* Alertas */}
        <div className="bg-white rounded-md p-2.5 border border-gray-300 mb-2">
          <h5 className="text-xs font-bold mb-1 text-gray-600"><AlertTriangle size={12} className="inline mr-1" /> Alertas Inteligentes</h5>
          {alertas.length === 0 ? (
            <div className="text-gray-500 text-xs">Nenhum alerta encontrado.</div>
          ) : alertas.map((a, i) => (
            <div key={i} className={`text-xs py-1 px-2 mb-0.5 border-l-4 flex items-center gap-2 ${a.type === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-400 bg-yellow-50'}`}>
              <span>{a.msg}</span>
            </div>
          ))}
        </div>

        {/* Solicitações Pendentes */}
        {solicitacoes.length > 0 && (
          <div className="bg-white rounded-md p-2.5 border border-gray-300 max-h-[180px] overflow-y-auto">
            <h5 className="text-xs font-bold mb-1 text-gray-600"><Clock size={12} className="inline mr-1" /> Solicitações Pendentes</h5>
            {solicitacoes.map(sol => {
              const prof = profissionais.find(p => p.id === sol.profissional_id);
              return (
                <div key={sol.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs py-1.5 border-b border-gray-100 gap-1">
                  <span className="flex-1"><strong>{sol.tipo === 'update' ? 'Alteração' : 'Exclusão'}</strong> - {prof?.nome_profissional || sol.dados_antigos?.nome_profissional || `ID ${sol.profissional_id}`} <span className="text-gray-500">{new Date(sol.criado_em).toLocaleString()}</span></span>
                  <div className="flex gap-1 self-end sm:self-auto">
                    <button onClick={() => setSolicitacaoModal(sol)} className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 py-0.5 text-[10px] font-bold cursor-pointer">Aprovar</button>
                    <button onClick={async () => {
                      if (window.confirm(`Rejeitar solicitação de ${sol.tipo === 'update' ? 'alteração' : 'exclusão'}?`)) {
                        await supabase.from('solicitacoes').update({ status: 'rejeitado' }).eq('id', sol.id);
                        recarregar();
                      }
                    }} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-0.5 text-[10px] font-bold cursor-pointer">Rejeitar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unit Selector */}
      <div className="flex flex-wrap items-center gap-2 px-3 md:px-4 py-2.5 bg-gray-50 border-b border-gray-300">
        <label className="font-bold text-xs md:text-sm">Unidade:</label>
        <input type="text" value={buscaUnidade} onChange={e => setBuscaUnidade(e.target.value)} placeholder="🔍 Buscar..."
          className="flex-1 min-w-[140px] md:min-w-[200px] px-2 py-1.5 border border-gray-300 rounded text-xs md:text-sm" />
        <select value={unidadeFiltro} onChange={e => setUnidadeFiltro(e.target.value)}
          className="flex-1 min-w-[180px] md:min-w-[250px] px-2 py-1.5 border border-gray-300 rounded text-xs md:text-sm">
          <option value="__todos__">Todas as unidades</option>
          {unidadeOptions.map(u => (
            <option key={u.cnes} value={u.cnes}>{u.cnes} - {u.nome_unidade}</option>
          ))}
        </select>
        <button onClick={() => recarregar()} className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><Search size={14} /> Filtrar</button>
        <button onClick={() => setRelatoriosModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><BarChart3 size={14} /> Rel.</button>
        <button onClick={() => window.print()} className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><FileText size={14} /> PDF</button>
        <button onClick={exportarCSV} className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-1.5 rounded font-bold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer"><Download size={14} /> CSV</button>
      </div>

      {/* Global Search */}
      <div className="flex flex-wrap items-center gap-2 px-3 md:px-4 py-2.5 bg-gray-50 border-b border-gray-300">
        <input type="text" value={buscaGlobal} onChange={e => setBuscaGlobal(e.target.value)} placeholder="🔍 Buscar por nome, CPF ou especialidade..."
          className="flex-1 min-w-[180px] md:min-w-[200px] px-2 md:px-3 py-2 border border-gray-300 rounded text-xs md:text-sm" />
        <select value={filtroEspecialidade} onChange={e => setFiltroEspecialidade(e.target.value)} className="min-w-[110px] md:min-w-[130px] px-2 py-2 border border-gray-300 rounded text-xs md:text-sm bg-white">
          <option value="todos">Todos</option>
          <option value="medico">Médico</option>
          <option value="enfermeiro">Enfermeiro</option>
          <option value="dentista">Dentista</option>
        </select>
        <select value={filtroControle} onChange={e => setFiltroControle(e.target.value)} className="min-w-[120px] md:min-w-[140px] px-2 py-2 border border-gray-300 rounded text-xs md:text-sm bg-white">
          <option value="todos">Todos</option>
          <option value="pendentes">Pendentes</option>
          <option value="concluidos">Concluídos</option>
        </select>
        <span className="text-xs md:text-sm text-gray-500">{loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded" /> : `${profissionaisFiltrados.length} encontrados`}</span>
        <button onClick={marcarTodosConcluidos} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-bold text-[11px] md:text-xs flex items-center gap-1.5 cursor-pointer">
          <CheckCheck size={14} /> Concluir
        </button>
      </div>

      {/* Section: Dados da Unidade */}
      <div className="bg-[var(--cor-primaria)] text-white px-3 md:px-4 py-1 font-bold text-xs md:text-sm">1. DADOS DA UNIDADE</div>
      <div className="flex flex-wrap items-center gap-4 md:gap-8 px-3 md:px-5 py-3 bg-gray-50 border-b-2 border-[var(--cor-primaria)]">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-bold text-[var(--cor-primaria)]">CNES:</span>
          <span className="font-bold text-base md:text-lg text-[var(--cor-primaria)] bg-gray-200 px-2 md:px-3 py-1 rounded border-2 border-[var(--cor-primaria)]">{unidadeSelecionada?.cnes || '--'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-bold text-[var(--cor-primaria)]">Unidade:</span>
          <span className="font-bold text-base md:text-lg text-[var(--cor-primaria)] bg-gray-200 px-2 md:px-3 py-1 rounded border-2 border-[var(--cor-primaria)]">{unidadeSelecionada?.nome_unidade || '--'}</span>
        </div>
      </div>

      {/* Section: Profissionais */}
      <div className="bg-[var(--cor-primaria)] text-white px-3 md:px-4 py-1 font-bold text-xs md:text-sm">2. RELAÇÃO DOS PROFISSIONAIS</div>
      <ProfessionalsTable
        profissionaisFiltrados={profissionaisFiltrados}
        onMarcarConcluido={marcarConcluido}
        getCboDesc={getCboDesc}
      />

      {/* Footer */}
      <div className="mt-auto bg-gray-100 border-t-2 border-[var(--cor-primaria)] px-3 md:px-5 py-4 text-center text-[11px] md:text-xs text-gray-700">
        <p className="my-0.5">Desenvolvido por Cristian Marques</p>
        <p className="my-0.5">SEMUSA - Secretaria Municipal de Saúde de Porto Velho</p>
        <p className="text-[10px] md:text-[11px] text-gray-500">Avenida Campos Sales, 2283 - Centro - Porto Velho/RO - CEP: 76804-358</p>
        <p className="text-[10px] md:text-[11px] text-gray-500">Telefone: (69) 3901-6126 | E-mail: gecav.semusa@portovelho.ro.gov.br</p>
        <p className="text-[10px] md:text-[11px] text-gray-400 mt-1">© 2026 - Todos os direitos reservados</p>
      </div>

      </>
      )}

      {/* Reports Modal */}
      <Suspense fallback={null}>
        <ReportsModal
          isOpen={relatoriosModal}
          onClose={() => setRelatoriosModal(false)}
          profissionais={profissionais}
          unidades={unidades}
          solicitacoes={solicitacoes}
        />
      </Suspense>

      {/* KPI Detail Modal */}
      <Suspense fallback={null}>
        <KpiDetailModal
          isOpen={!!kpiModal}
          onClose={() => setKpiModal(null)}
          titulo={kpiModal?.titulo || ''}
          profissionais={kpiModal?.lista || []}
          unidades={unidades}
        />
      </Suspense>

      {/* Approval Modal */}
      <Suspense fallback={null}>
        <ApprovalModal
          isOpen={!!solicitacaoModal}
          onClose={() => setSolicitacaoModal(null)}
          solicitacao={solicitacaoModal}
          unidades={unidades}
          profissionais={profissionais}
          onComplete={handleAprovacaoCompleta}
        />
      </Suspense>

      {/* Print-only Ficha */}
      <Suspense fallback={null}>
        <PrintFicha
          profissionais={profissionaisFiltrados}
          unidade={unidadeSelecionada}
          dataEmissao={dataEmissao}
          getCboDesc={getCboDesc}
        />
      </Suspense>
    </div>
  );
}
