import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { UserCircle, Save, Mail, Shield, Calendar, Phone, Building2 } from 'lucide-react';

const ROLE_CONFIG = {
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  viewer: { label: 'Visualizador', color: 'bg-gray-100 text-gray-600 border-gray-300' },
};

const AVATAR_COLORS = ['#003c7d', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, signOut } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (profile) setNome(profile.nome || '');
  }, [profile]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setMensagem('O nome é obrigatório.');
      return;
    }
    setSalvando(true);
    setMensagem('');
    try {
      const { error } = await supabase.from('profiles').update({ nome: nome.trim() }).eq('id', user.id);
      if (error) throw error;
      setMensagem('✅ Nome atualizado com sucesso!');
      setEditando(false);
      // Recarrega a página para atualizar o nome no header
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setMensagem('❌ Erro: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const roleConfig = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.viewer;
  const avatarColor = AVATAR_COLORS[(user?.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 Meu Perfil" maxWidth="max-w-[500px]">
      <div className="flex flex-col items-center py-4">
        {/* Avatar grande */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg"
          style={{ background: avatarColor }}
        >
          {getInitials(nome || profile?.nome || user?.email)}
        </div>

        {/* Info cards */}
        <div className="w-full space-y-3 mt-2">
          {/* Nome */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <UserCircle size={12} /> Nome
              </span>
              {!editando && (
                <button onClick={() => setEditando(true)}
                  className="text-[10px] text-[var(--cor-primaria)] hover:underline cursor-pointer font-bold">
                  Editar
                </button>
              )}
            </div>
            {editando ? (
              <div className="flex gap-2">
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSalvar(); if (e.key === 'Escape') setEditando(false); }} />
                <button onClick={handleSalvar} disabled={salvando}
                  className="bg-[var(--cor-primaria)] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[var(--cor-primaria-hover)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1">
                  <Save size={12} /> {salvando ? '...' : 'Salvar'}
                </button>
              </div>
            ) : (
              <p className="font-bold text-gray-800">{profile?.nome || '—'}</p>
            )}
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Mail size={12} /> E-mail
            </span>
            <p className="font-bold text-gray-800 text-sm">{user?.email || '—'}</p>
          </div>

          {/* Perfil / Role */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Shield size={12} /> Perfil de Acesso
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
          </div>

          {/* Membro desde */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Calendar size={12} /> Membro desde
            </span>
            <p className="font-bold text-gray-800 text-sm">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>

          {/* ID do usuário (técnico) */}
          <details className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer">
            <summary className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Informações Técnicas
            </summary>
            <p className="text-[10px] text-gray-400 mt-1 break-all font-mono">ID: {user?.id || '—'}</p>
          </details>
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className="mt-3 text-sm font-bold text-center w-full bg-gray-50 py-2 rounded-lg border border-gray-200">
            {mensagem}
          </div>
        )}
      </div>
    </Modal>
  );
}
