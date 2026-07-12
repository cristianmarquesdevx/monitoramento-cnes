import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-500 dark:border-red-400 p-8 max-w-lg text-center shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Erro no Sistema</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Ocorreu um erro inesperado. Tente recarregar a página.</p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-left max-h-32 overflow-auto mb-4 text-red-700 dark:text-red-300">
              {this.state.error?.message || 'Erro desconhecido'}
            </pre>
            <button onClick={() => window.location.reload()} className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-6 py-2 rounded font-bold cursor-pointer">
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
