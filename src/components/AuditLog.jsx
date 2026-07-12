import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Edit3, Trash2, MousePointerClick, Search } from 'lucide-react';

const ACAO_CONFIG = {
  approve: { label: 'Aprovou', icon: CheckCircle, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
  reject: { label: 'Rejeitou', icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
  controle: { label: 'Controle', icon: MousePointerClick, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  update: { label: 'Alterou', icon: Edit3, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  delete: { label: 'Excluiu', icon: Trash2, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
};

export default function AuditLog({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [busca, setBusca] = useState('');

  const carregarLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200);
      if (filtroAcao !== 'todos') query = query.eq('acao', filtroAcao);
      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (e) {
      console.error('Erro ao carregar auditoria:', e.message);
    } finally {
      setLoading(false);
    }
  }, [filtroAcao]);

  useEffect(() => { carregarLogs(); }, [carregarLogs]);

  const filtrados = logs.filter(l =>
    !busca || l.usuario_nome.toLowerCase().includes(busca.toLowerCase()) || l.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b-2 border-[var(--cor-primaria)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer text-gray-800 dark:text-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--cor-primaria)] dark:text-[#8ab4f8]">Histórico de Auditoria</h1>
        <div className="flex-1" />
        <button onClick={carregarLogs} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer text-gray-800 dark:text-gray-100" title="Recarregar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por usuário ou descrição..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
          </div>
          <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <option value="todos">Todas as ações</option>
            <option value="approve">Aprovações</option>
            <option value="reject">Rejeições</option>
            <option value="controle">Controles</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">{filtrados.length} registros</span>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum registro encontrado.</div>
          ) : filtrados.map(log => {
            const config = ACAO_CONFIG[log.acao] || ACAO_CONFIG.update;
            const Icon = config.icon;
            return (
              <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className={`p-2 rounded-full ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-800 dark:text-gray-100">{log.usuario_nome}</span>
                    <span className="text-gray-500 dark:text-gray-400">{config.label}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{log.tipo}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{log.descricao}</p>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
