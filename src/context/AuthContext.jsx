import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error.message);
      }
      if (data) setProfile(data);
    } catch (e) {
      console.error('Erro ao buscar perfil:', e.message);
    }
  }, []);

  // Timeout de segurança: se o Supabase não responder, sai do loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error('Erro ao verificar sessão:', err.message);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Registrar login na auditoria (fire-and-forget)
    try {
      const nome = profile?.nome || data.user?.user_metadata?.nome || data.user?.email?.split('@')[0] || 'Usuário';
      supabase.rpc('log_audit', {
        p_usuario_id: data.user.id,
        p_usuario_nome: nome,
        p_acao: 'login',
        p_tipo: 'sessao',
        p_target_id: data.user.id,
        p_descricao: 'Fez login no sistema'
      }).catch(() => {});
    } catch {}

    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin, isEditor }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
