import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AdminUsers from './components/AdminUsers';
import AuditLog from './components/AuditLog';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-5 transition-opacity duration-400">
        <div className="relative w-[70px] h-[70px] flex items-center justify-center">
          <div className="absolute w-full h-full border-4 border-[var(--cor-primaria-claro)] border-t-[var(--cor-primaria)] rounded-full animate-spin" />
          <svg className="w-7 h-7 text-[var(--cor-primaria)] z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <p className="text-[var(--cor-primaria)] text-sm font-semibold animate-pulse">Carregando sistema...</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const isAdmin = profile?.role === 'admin';

  if (page === 'admin' && isAdmin) {
    return <AdminUsers onBack={() => setPage('dashboard')} />;
  }

  if (page === 'audit') {
    return <AuditLog onBack={() => setPage('dashboard')} />;
  }

  return (
    <DataProvider>
      <Dashboard onNavigate={setPage} />
    </DataProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
