import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, Eye, ArrowLeft, Search, RefreshCw } from 'lucide-react';

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
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

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
        nome: profMap[u.id]?.nome || u.user_metadata?.nome || u.email?.split('@')[0] || '',
        role: profMap[u.id]?.role || 'viewer',
      }));
      setUsuarios(combined);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function salvarRole(userId, newRole) {
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, role: newRole, nome: usuarios.find(u => u.id === userId)?.nome || '' })
        .eq('id', userId);
      if (error) throw error;
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditando(null);
    } catch (e) {
      console.error('Erro ao salvar role:', e.message);
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

  const filtrados = usuarios.filter(u =>
    !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b-2 border-[var(--cor-primaria)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--cor-primaria)]">Administração de Usuários</h1>
        <div className="flex-1" />
        <button onClick={carregarUsuarios} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" title="Recarregar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Perfil</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(u => {
                  const RoleIcon = ROLE_CONFIG[u.role]?.icon || Eye;
                  const isCurrentUser = u.id === currentProfile?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editando === u.id ? (
                          <input type="text" defaultValue={u.nome}
                            onBlur={e => salvarNome(u.id, e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && salvarNome(u.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                            autoFocus />
                        ) : (
                          <span className="font-bold text-sm cursor-pointer"
                            onClick={() => setEditando(u.id)}
                            title="Clique para editar o nome">
                            {u.nome || '—'}
                            {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(você)</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <select value={u.role}
                          onChange={e => salvarRole(u.id, e.target.value)}
                          disabled={salvando && editando === u.id}
                          className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer ${ROLE_CONFIG[u.role]?.color || ''}`}>
                          <option value="admin">Administrador</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Visualizador</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RoleIcon size={16} className={`inline ${u.role === 'admin' ? 'text-purple-600' : u.role === 'editor' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </td>
                    </tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Dica: Clique no nome do usuário para editar. Use o select para alterar o perfil.
        </p>
      </div>
    </div>
  );
}
