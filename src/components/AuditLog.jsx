import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Edit3, Trash2, MousePointerClick, Search } from 'lucide-react';

const ACAO_CONFIG = {
  approve: { label: 'Aprovou', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  reject: { label: 'Rejeitou', icon: XCircle, color: 'text-red-600 bg-red-50' },
  controle: { label: 'Controle', icon: MousePointerClick, color: 'text-blue-600 bg-blue-50' },
  update: { label: 'Alterou', icon: Edit3, color: 'text-yellow-600 bg-yellow-50' },
  delete: { label: 'Excluiu', icon: Trash2, color: 'text-orange-600 bg-orange-50' },
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b-2 border-[var(--cor-primaria)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--cor-primaria)]">Histórico de Auditoria</h1>
        <div className="flex-1" />
        <button onClick={carregarLogs} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" title="Recarregar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por usuário ou descrição..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white">
            <option value="todos">Todas as ações</option>
            <option value="approve">Aprovações</option>
            <option value="reject">Rejeições</option>
            <option value="controle">Controles</option>
          </select>
          <span className="text-xs text-gray-500 self-center">{filtrados.length} registros</span>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum registro encontrado.</div>
          ) : filtrados.map(log => {
            const config = ACAO_CONFIG[log.acao] || ACAO_CONFIG.update;
            const Icon = config.icon;
            return (
              <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className={`p-2 rounded-full ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-800">{log.usuario_nome}</span>
                    <span className="text-gray-500">{config.label}</span>
                    <span className="text-gray-400 text-xs">{log.tipo}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{log.descricao}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
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
