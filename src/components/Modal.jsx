import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-[950px]' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 dark:bg-black/70" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-5 relative border border-[var(--cor-primaria)] dark:border-[#3a5a7a]`}>
        <button onClick={onClose} className="absolute top-2.5 right-4 text-[var(--cor-primaria)] dark:text-[#8ab4f8] hover:text-red-500 dark:hover:text-red-400 text-3xl bg-none border-none cursor-pointer leading-none" aria-label="Fechar">&times;</button>
        {title && <h3 className="text-[var(--cor-primaria)] dark:text-[#8ab4f8] mb-4 pb-2 border-b-2 border-[var(--cor-primaria)] dark:border-[#3a5a7a] font-bold text-lg">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
