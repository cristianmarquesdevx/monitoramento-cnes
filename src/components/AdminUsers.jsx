import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Shield, ShieldCheck, Eye, ArrowLeft, Search, RefreshCw,
  Filter, AlertTriangle, CheckCircle2
} from 'lucide-react';
import Avatar from './Avatar';

const ROLE_CONFIG = {
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: ShieldCheck },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Shield },
  viewer: { label: 'Visualizador', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: Eye },
};

export default function AdminUsers({ onBack }) {
  const { profile: currentProfile } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState('todos');
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // { userId, novaRole, nome }
  const [mensagem, setMensagem] = useState('');

  useEffect(() => { carregarUsuarios(); }, []);

  async function carregarUsuarios() {
    setLoading(true);
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
      if (profError) throw profError;

      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      const combined = (authUsers?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        nome: profMap[u.id]?.nome || u.user_metadata?.nome || u.email?.split('@')[0] || '',
        role: profMap[u.id]?.role || 'viewer',
      }));
      setUsuarios(combined);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e.message);
      setMensagem('❌ Erro ao carregar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function logAuditRole(userId, userName, oldRole, newRole) {
    try {
      await supabase.rpc('log_audit', {
        p_usuario_id: currentProfile?.id || '',
        p_usuario_nome: currentProfile?.nome || 'Sistema',
        p_acao: 'role_change',
        p_tipo: 'usuario',
        p_target_id: userId,
        p_descricao: `Alterou perfil de "${userName}" de ${oldRole} para ${newRole}`
      });
    } catch (e) {
      console.error('Erro ao registrar auditoria:', e.message);
    }
  }

  async function confirmarMudanca() {
    if (!confirmando) return;
    const { userId, novaRole, nome } = confirmando;
    const usuario = usuarios.find(u => u.id === userId);
    const oldRole = usuario?.role || 'viewer';

    setSalvando(true);
    setMensagem('');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, role: novaRole, nome: nome || '' })
        .eq('id', userId);
      if (error) throw error;

      // Auditar mudança de role
      await logAuditRole(userId, nome, oldRole, novaRole);

      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, role: novaRole } : u));
      setConfirmando(null);
      setMensagem(`✅ Perfil de "${nome}" alterado para ${ROLE_CONFIG[novaRole]?.label}`);
      setTimeout(() => setMensagem(''), 3000);
    } catch (e) {
      setMensagem('❌ Erro: ' + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarNome(userId, nome) {
    try {
      const { error } = await supabase.from('profiles').upsert({ id: userId, nome }).eq('id', userId);
      if (error) throw error;
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, nome } : u));
      setEditando(null);
    } catch (e) {
      console.error('Erro ao salvar nome:', e.message);
    }
  }

  const filtrados = useMemo(() => {
    let lista = usuarios;
    if (busca) {
      const q = busca.toLowerCase();
      lista = lista.filter(u =>
        u.nome.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (filtroRole !== 'todos') {
      lista = lista.filter(u => u.role === filtroRole);
    }
    return lista;
  }, [usuarios, busca, filtroRole]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-[var(--cor-primaria)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--cor-primaria)] flex items-center gap-2">
          <Shield size={20} /> Administração de Usuários
        </h1>
        <div className="flex-1" />
        <button onClick={carregarUsuarios} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" title="Recarregar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
            <Filter size={14} /> Filtros
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs" />
            </div>
            <select value={filtroRole} onChange={e => setFiltroRole(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
              <option value="todos">Todos os perfis</option>
              <option value="admin">Administradores</option>
              <option value="editor">Editores</option>
              <option value="viewer">Visualizadores</option>
            </select>
            <span className="text-xs text-gray-500 self-center">{filtrados.length} usuário(s)</span>
          </div>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-bold border ${
            mensagem.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' :
            mensagem.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {mensagem}
          </div>
        )}

        {/* Modal de confirmação */}
        {confirmando && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmando(null)}>
            <div className="bg-white rounded-lg p-5 max-w-sm w-full border-2 border-orange-300 shadow-xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-orange-500" />
                <h3 className="font-bold text-gray-800">Confirmar Alteração de Perfil</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Deseja alterar o perfil de <strong>{confirmando.nome}</strong> para{' '}
                <strong>{ROLE_CONFIG[confirmando.novaRole]?.label}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmando(null)}
                  className="px-4 py-2 rounded text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">
                  Cancelar
                </button>
                <button onClick={confirmarMudanca} disabled={salvando}
                  className="px-4 py-2 rounded text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 cursor-pointer disabled:opacity-50 flex items-center gap-1">
                  {salvando ? '...' : <><CheckCircle2 size={14} /> Confirmar</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                  <th className="px-4 py-3 text-left" colSpan={2}>Usuário</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Perfil</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Último acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(u => {
                  const roleConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer;
                  const RoleIcon = roleConfig.icon;
                  const isCurrentUser = u.id === currentProfile?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 w-10">
                        <Avatar nome={u.nome} size={32} />
                      </td>
                      <td className="px-4 py-3">
                        {editando === u.id ? (
                          <input type="text" defaultValue={u.nome}
                            onBlur={e => salvarNome(u.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') salvarNome(u.id, e.target.value);
                              if (e.key === 'Escape') setEditando(null);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                            autoFocus />
                        ) : (
                          <span className="font-bold text-sm cursor-pointer hover:text-[var(--cor-primaria)]"
                            onClick={() => setEditando(u.id)}
                            title="Clique para editar o nome">
                            {u.nome || '—'}
                            {isCurrentUser && <span className="text-xs text-gray-400 ml-1 font-normal">(você)</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <select value={u.role}
                          onChange={e => setConfirmando({ userId: u.id, novaRole: e.target.value, nome: u.nome })}
                          className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer ${roleConfig.color}`}>
                          {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-gray-500 justify-center">
          <span>💡 Clique no nome para editar</span>
          <span>•</span>
          <span>⚠️ Alterar perfil exige confirmação</span>
          <span>•</span>
          <span>📋 Mudanças são registradas em auditoria</span>
        </div>
      </div>
    </div>
  );
}
