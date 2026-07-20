import { createContext, useContext, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [unidades, setUnidades] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uniRes, profRes, solRes] = await Promise.all([
        supabase.from('unidades_saude').select('*').order('nome_unidade'),
        supabase.from('profissionais').select('*').order('created_at', { ascending: false }),
        supabase.from('solicitacoes').select('*').eq('status', 'pendente').in('tipo', ['update', 'delete']).order('criado_em', { ascending: false })
      ]);
      if (uniRes.error) throw uniRes.error;
      if (profRes.error) throw profRes.error;
      if (solRes.error) throw solRes.error;
      setUnidades(uniRes.data || []);
      setProfissionais(profRes.data || []);
      setSolicitacoes(solRes.data || []);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const recarregar = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{ unidades, profissionais, solicitacoes, loading, loadData, recarregar, setSolicitacoes, setProfissionais, setUnidades }}>
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
