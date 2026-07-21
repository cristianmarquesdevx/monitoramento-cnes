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
    <div ref={overlayRef} className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-5 bg-black/50" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`bg-white rounded-lg w-full ${maxWidth} max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-3 md:p-5 relative border border-[var(--cor-primaria)]`}>
        <button onClick={onClose} className="absolute top-1.5 right-2 md:top-2.5 md:right-4 text-[var(--cor-primaria)] hover:text-red-500 text-2xl md:text-3xl bg-none border-none cursor-pointer leading-none z-10 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center" aria-label="Fechar">&times;</button>
        {title && <h3 className="text-[var(--cor-primaria)] mb-4 pb-2 border-b-2 border-[var(--cor-primaria)] font-bold text-lg">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
