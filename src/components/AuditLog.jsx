import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, RefreshCw, CheckCircle, XCircle, Edit3, Trash2,
  MousePointerClick, Search, Download, LogIn, Shield,
  ChevronDown, ChevronRight, Filter, Calendar, History
} from 'lucide-react';
import Avatar from './Avatar';

const ITENS_POR_PAGINA = 50;

const ACAO_CONFIG = {
  approve: { label: 'Aprovou', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  reject: { label: 'Rejeitou', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
  controle: { label: 'Controle', icon: MousePointerClick, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  update: { label: 'Alterou', icon: Edit3, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  delete: { label: 'Excluiu', icon: Trash2, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  login: { label: 'Login', icon: LogIn, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  export: { label: 'Exportou', icon: Download, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  role_change: { label: 'Alterou Perfil', icon: Shield, color: 'text-orange-600 bg-orange-50 border-orange-200' },
};

function formatDataHora(data) {
  if (!data) return '';
  const d = new Date(data);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function extrairUsuarioOptions(logs) {
  const map = new Map();
  logs.forEach(l => {
    if (l.usuario_id && !map.has(l.usuario_id)) {
      map.set(l.usuario_id, { id: l.usuario_id, nome: l.usuario_nome || 'Desconhecido' });
    }
  });
  return [{ id: '__todos__', nome: 'Todos os usuários' }, ...Array.from(map.values())];
}

function DetalhesAlteracao({ detalhes, descricao }) {
  // Tenta extrair dados do campo detalhes (coluna JSONB) ou da descrição (formato |||JSON|||)
  let data = null;
  
  if (detalhes) {
    try {
      data = typeof detalhes === 'string' ? JSON.parse(detalhes) : detalhes;
    } catch {}
  }
  
  if (!data && descricao) {
    const match = descricao.match(/\|\|\|(.+?)\|\|\|/);
    if (match) {
      try { data = JSON.parse(match[1]); } catch {}
    }
  }

  if (!data || !data.campos || data.campos.length === 0) return null;

  return (
    <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Campos Alterados</p>
      <div className="space-y-1">
        {data.campos.map((campo, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="font-semibold text-gray-700 min-w-[100px]">{campo.label || campo.nome}:</span>
            <span className="text-red-600 line-through mr-1">{campo.de || '—'}</span>
            <span className="text-green-600 font-medium">→ {campo.para || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuditLog({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('__todos__');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState(null);
  const [erro, setErro] = useState('');
  const logsCache = useRef([]);

  const carregarLogs = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      let query = supabase
        .from('audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filtroAcao !== 'todos') query = query.eq('acao', filtroAcao);
      if (filtroUsuario !== '__todos__') query = query.eq('usuario_id', filtroUsuario);
      if (dataInicio) query = query.gte('created_at', dataInicio + 'T00:00:00');
      if (dataFim) query = query.lte('created_at', dataFim + 'T23:59:59');
      if (busca.trim()) query = query.ilike('descricao', `%${busca.trim()}%`);

      const from = (pagina - 1) * ITENS_POR_PAGINA;
      const to = from + ITENS_POR_PAGINA - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      setLogs(data || []);
      setTotal(count || 0);
      logsCache.current = data || [];
    } catch (e) {
      console.error('Erro ao carregar auditoria:', e.message);
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [filtroAcao, filtroUsuario, dataInicio, dataFim, busca, pagina]);

  useEffect(() => { carregarLogs(); }, [carregarLogs]);

  // Carregar usuários para o filtro (busca todos os logs para obter usuários distintos)
  const [usuariosFiltro, setUsuariosFiltro] = useState([]);
  useEffect(() => {
    supabase.from('audit_log').select('usuario_id, usuario_nome').order('usuario_nome')
      .then(({ data }) => {
        if (data) setUsuariosFiltro(extrairUsuarioOptions(data));
      })
      .catch(() => {});
  }, []);

  // Resetar página quando filtros mudarem
  useEffect(() => { setPagina(1); }, [filtroAcao, filtroUsuario, dataInicio, dataFim, busca]);

  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));

  const exportarCSV = () => {
    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Tipo', 'Descrição', 'ID Alvo'];
    const rows = logsCache.current.map(log => [
      formatDataHora(log.created_at),
      log.usuario_nome,
      ACAO_CONFIG[log.acao]?.label || log.acao,
      log.tipo,
      `"${(log.descricao || '').replace(/"/g, '""')}"`,
      log.target_id
    ].join(','));

    const blob = new Blob(['\ufeff' + headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const toggleExpand = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-[var(--cor-primaria)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--cor-primaria)] flex items-center gap-2">
          <History size={20} /> Histórico de Auditoria
        </h1>
        <div className="flex-1" />
        <button onClick={exportarCSV}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer">
          <Download size={14} /> Exportar CSV
        </button>
        <button onClick={carregarLogs} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" title="Recarregar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1">
            <Filter size={14} /> Filtros
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Busca textual */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar na descrição..."
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs" />
            </div>
            {/* Filtro ação */}
            <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
              <option value="todos">Todas as ações</option>
              {Object.entries(ACAO_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            {/* Filtro usuário */}
            <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
              {usuariosFiltro.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            {/* Data início */}
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs" />
            </div>
            {/* Data fim */}
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs" />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
          <span>{loading ? 'Carregando...' : `${total} registro(s) encontrado(s)`}</span>
          {erro && <span className="text-red-500 font-bold">Erro: {erro}</span>}
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">Nenhum registro encontrado.</p>
              <p className="text-xs mt-1">Tente ajustar os filtros.</p>
            </div>
          ) : logs.map(log => {
            const config = ACAO_CONFIG[log.acao] || ACAO_CONFIG.update;
            const Icon = config.icon;
            const isExpanded = expandido === log.id;
            const hasDetalhes = log.detalhes || log.descricao?.includes('|||');

            return (
              <div key={log.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                {/* Linha principal - clicável para expandir */}
                <div
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => hasDetalhes && toggleExpand(log.id)}
                >
                  <Avatar nome={log.usuario_nome} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="font-bold text-gray-800">{log.usuario_nome || 'Desconhecido'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${config.color}`}>
                        <Icon size={10} className="inline mr-0.5" />
                        {config.label}
                      </span>
                      <span className="text-gray-400 text-[11px]">{log.tipo}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {log.descricao || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatDataHora(log.created_at)}
                    </span>
                    {hasDetalhes && (
                      <span className="text-gray-400">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0">
                    <DetalhesAlteracao detalhes={log.detalhes} descricao={log.descricao} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina <= 1}
              className="px-3 py-1.5 rounded text-xs font-bold transition-all border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              « Anterior
            </button>
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let start = Math.max(1, pagina - Math.floor(maxVisible / 2));
              let end = Math.min(totalPaginas, start + maxVisible - 1);
              if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
              if (start > 1) pages.push(1);
              if (start > 2) pages.push('...');
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPaginas - 1) pages.push('...');
              if (end < totalPaginas) pages.push(totalPaginas);
              return pages.map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="px-2 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      p === pagina
                        ? 'bg-[var(--cor-primaria)] text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas}
              className="px-3 py-1.5 rounded text-xs font-bold transition-all border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próximo »
            </button>
            <span className="text-xs text-gray-500 ml-2">
              Página {pagina} de {totalPaginas}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
