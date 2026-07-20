import { createContext, useContext, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

async function fetchAllData() {
  const [uniRes, profRes, solRes] = await Promise.all([
    supabase.from('unidades_saude').select('*').order('nome_unidade'),
    supabase.from('profissionais').select('*').order('created_at', { ascending: false }),
    supabase.from('solicitacoes').select('*').eq('status', 'pendente').in('tipo', ['update', 'delete']).order('criado_em', { ascending: false })
  ]);
  if (uniRes.error) throw uniRes.error;
  if (profRes.error) throw profRes.error;
  if (solRes.error) throw solRes.error;
  return {
    unidades: uniRes.data || [],
    profissionais: profRes.data || [],
    solicitacoes: solRes.data || []
  };
}

export function DataProvider({ children }) {
  const [unidades, setUnidades] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregamento inicial (mostra skeleton)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllData();
      setUnidades(data.unidades);
      setProfissionais(data.profissionais);
      setSolicitacoes(data.solicitacoes);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh silencioso (sem skeleton, usado por realtime e ações do usuário)
  const refreshData = useCallback(async () => {
    try {
      const data = await fetchAllData();
      setUnidades(data.unidades);
      setProfissionais(data.profissionais);
      setSolicitacoes(data.solicitacoes);
    } catch (e) {
      console.error('Erro ao atualizar dados:', e);
    }
  }, []);

  const recarregar = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{ unidades, profissionais, solicitacoes, loading, loadData, refreshData, recarregar, setSolicitacoes, setProfissionais, setUnidades }}>
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
