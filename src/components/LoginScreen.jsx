import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, Moon, Sun, Shield, UserCircle, Mail, Lock } from 'lucide-react';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('loginTheme') === 'dark');

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('loginTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || !email.includes('.')) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada.');
      } else if (err.message?.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde alguns segundos.');
      } else {
        setError(err.message || 'Erro ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-5 overflow-y-auto transition-opacity duration-500 ${dark ? '' : ''}`}
         style={{ background: dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      
      <div className={`relative w-full max-w-[520px] rounded-lg overflow-hidden shadow-2xl ${dark ? 'bg-[#1e1e2e]' : 'bg-white'}`}
           style={{ border: dark ? '1px solid #444' : '1px solid #000' }}>
        
        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className={`absolute top-2.5 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer transition-all duration-300 hover:bg-[var(--cor-primaria)] hover:text-white ${dark ? 'bg-[#2a2a3e] border-[#3a3a4e] text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Header - igual ao dashboard */}
        <div className={`flex items-center justify-between px-4 py-3 flex-wrap gap-2.5 ${dark ? 'bg-[#1e1e2e]' : 'bg-white'}`}>
          <img src="/logo_prefeitura.png" alt="Prefeitura" className="h-[55px]" loading="lazy" />
          <div className="flex-1 text-center min-w-[200px]">
            <h2 className={`text-[clamp(13px,2.2vw,16px)] font-bold mb-0.5 ${dark ? 'text-[#8ab4f8]' : 'text-[var(--cor-primaria)]'}`}>
              PREFEITURA DO MUNICÍPIO DE PORTO VELHO
            </h2>
            <h3 className={`text-[clamp(10px,1.6vw,13px)] font-normal ${dark ? 'text-[#8ab4f8]' : 'text-[var(--cor-primaria)]'}`}>
              SECRETARIA MUNICIPAL DE SAÚDE – SEMUSA
            </h3>
            <h4 className={`text-[clamp(10px,1.5vw,12px)] font-normal ${dark ? 'text-[#8ab4f8]' : 'text-[var(--cor-primaria)]'}`}>
              DIVISÃO DE CONTROLE E AVALIAÇÃO DO SUS
            </h4>
          </div>
          <img src="/logo_cnes.png" alt="CNES" className="h-[55px]" loading="lazy" />
        </div>

        {/* Barra azul */}
        <div className="bg-[var(--cor-primaria)] text-white text-center py-1.5 px-3 font-bold text-[clamp(13px,2vw,15px)]">
          Sistema de Atualização Cadastral – CNES
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <div className={`flex items-center gap-2.5 text-base font-semibold mb-4 pb-3 border-b-2 ${dark ? 'text-[#8ab4f8] border-[#2a2a3e]' : 'text-[var(--cor-primaria)] border-gray-200'}`}>
            <UserCircle size={26} className={dark ? 'text-[#3a5a7a]' : 'text-[var(--cor-primaria-claro)]'} />
            <span>Faça login para continuar</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">
            {error && (
              <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3.5 py-2.5 rounded-md text-sm animate-[loginShake_0.4s_ease-out]">
                <Mail size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail size={14} className="text-[var(--cor-primaria)]" /> E-mail
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email" required
                className={`w-full px-3.5 py-2.5 border-2 rounded-md text-base outline-none transition-all duration-200 focus:border-[var(--cor-primaria)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,60,125,0.1)] ${dark ? 'bg-[#2a2a3e] border-[#3a3a4e] text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800'}`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Lock size={14} className="text-[var(--cor-primaria)]" /> Senha
              </label>
              <div className="relative flex items-center">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete="current-password" required
                  className={`w-full px-3.5 py-2.5 pr-11 border-2 rounded-md text-base outline-none transition-all duration-200 focus:border-[var(--cor-primaria)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,60,125,0.1)] ${dark ? 'bg-[#2a2a3e] border-[#3a3a4e] text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-gray-500 hover:text-[var(--cor-primaria)] p-2 rounded-md cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white font-bold py-3 px-4 rounded-md text-base flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,60,125,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> Autenticando...</>
              ) : (
                <><LogIn size={18} /> Entrar</>
              )}
            </button>

            <div className="text-center -mt-2">
              <button type="button"
                onClick={() => setError('Entre em contato com o administrador para redefinir sua senha.')}
                className="text-xs text-[var(--cor-primaria)] hover:text-[var(--cor-primaria-hover)] underline cursor-pointer transition-colors">
                Esqueceu sua senha?
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3.5 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-0.5"><Shield size={12} className="text-green-600 inline mr-1" /> Ambiente Seguro • Sistema GECAV</p>
            <p className="text-[11px] text-gray-400">© 2026 - SEMUSA - Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
