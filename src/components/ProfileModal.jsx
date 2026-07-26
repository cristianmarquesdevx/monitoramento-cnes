import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { UserCircle, Save, Mail, Shield, Calendar, Camera } from 'lucide-react';

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

/** Redimensiona imagem para no máximo 200x200 e retorna data URL base64 */
function resizeImage(file, maxDim = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const prevProfileRef = useRef(null);

  // Sincroniza com o profile quando ele muda
  useEffect(() => {
    if (profile && profile !== prevProfileRef.current) {
      prevProfileRef.current = profile;
      setNome(profile.nome || '');
      setAvatarUrl(profile.avatar_url || '');
    }
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
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setMensagem('❌ Erro: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMensagem('❌ Selecione uma imagem válida.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMensagem('❌ A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploading(true);
    setMensagem('');
    try {
      // Redimensiona para evitar data URLs gigantes
      const dataUrl = await resizeImage(file, 200);
      // Salva no profile
      const { error } = await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', user.id);
      if (error) throw error;
      setAvatarUrl(dataUrl);
      setMensagem('✅ Foto atualizada com sucesso!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setMensagem('❌ Erro ao salvar foto: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!avatarUrl) return;
    setUploading(true);
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (error) throw error;
      setAvatarUrl('');
      setMensagem('✅ Foto removida.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setMensagem('❌ Erro: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const roleConfig = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.viewer;
  const avatarColor = AVATAR_COLORS[(user?.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 Meu Perfil" maxWidth="max-w-[500px]">
      <div className="flex flex-col items-center py-4">
        {/* Avatar com upload */}
        <div className="relative mb-3 group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-gray-200"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-gray-200"
              style={{ background: avatarColor }}
            >
              {getInitials(nome || profile?.nome || user?.email)}
            </div>
          )}
          {/* Botão de câmera sobre o avatar */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--cor-primaria)] text-white flex items-center justify-center shadow-md hover:bg-[var(--cor-primaria-hover)] transition-all cursor-pointer disabled:opacity-50"
            title="Alterar foto"
          >
            <Camera size={12} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {avatarUrl && (
          <button
            onClick={handleRemovePhoto}
            className="text-[10px] text-red-500 hover:text-red-700 underline mb-2 cursor-pointer"
          >
            Remover foto
          </button>
        )}

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
          <div className={`mt-3 text-sm font-bold text-center w-full py-2 rounded-lg border ${
            mensagem.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' :
            mensagem.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            {mensagem}
          </div>
        )}
      </div>
    </Modal>
  );
}
