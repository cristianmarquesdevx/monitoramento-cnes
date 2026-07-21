import Modal from './Modal';
import { listaCBO } from '../data/cboData';

function descCbo(codigo) {
  if (!codigo) return '—';
  const cbo = listaCBO.find(c => c.codigo === codigo)?.descricao || codigo;
  if (cbo.length > 30) return cbo.substring(0, 28) + '…';
  return cbo;
}

const COLUNAS = [
  { key: 'nome_profissional', label: 'Nome', width: 'w-[180px]' },
  { key: 'cpf', label: 'CPF', width: 'w-[120px]' },
  { key: 'cns', label: 'CNS', width: 'w-[140px]' },
  { key: 'cbo', label: 'CBO', width: 'w-[160px]' },
  { key: 'conselho', label: 'Cons.', width: 'w-[70px]' },
  { key: 'registro', label: 'Reg.', width: 'w-[90px]' },
  { key: 'cargo_funcao', label: 'Cargo', width: 'w-[130px]' },
  { key: 'cnes', label: 'Unid.', width: 'w-[80px]' },
];

export default function KpiDetailModal({ isOpen, onClose, titulo, profissionais }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} maxWidth="max-w-[900px]">
      <p className="text-sm text-gray-500 mb-3">
        Total: <strong className="text-[var(--cor-primaria)]">{profissionais.length}</strong> profissionais
      </p>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-2 mb-3 max-h-[400px] overflow-y-auto">
        {profissionais.length === 0 ? (
          <div className="text-center py-6 text-gray-400">Nenhum profissional encontrado.</div>
        ) : profissionais.map((p, i) => (
          <div key={p.id || i} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="font-bold text-sm mb-1.5">{p.nome_profissional || '—'}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div><span className="text-gray-500">CPF:</span> <span className="font-bold">{p.cpf || '—'}</span></div>
              <div><span className="text-gray-500">CNS:</span> <span className="font-bold">{p.cns || '—'}</span></div>
              <div className="col-span-2"><span className="text-gray-500">CBO:</span> <span className="font-bold">{descCbo(p.cbo)}</span></div>
              <div><span className="text-gray-500">Cons.:</span> <span className="font-bold">{p.conselho || '—'}</span></div>
              <div><span className="text-gray-500">Reg.:</span> <span className="font-bold">{p.registro || '—'}</span></div>
              <div><span className="text-gray-500">Cargo:</span> <span className="font-bold">{p.cargo_funcao || '—'}</span></div>
              <div><span className="text-gray-500">Unid.:</span> <span className="font-bold">{p.cnes || '—'}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--cor-primaria-claro)] text-center text-xs font-bold uppercase text-gray-700">
              {COLUNAS.map(col => (
                <th key={col.key} className={`${col.width} border border-gray-300 px-2 py-2`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profissionais.length === 0 ? (
              <tr>
                <td colSpan={COLUNAS.length} className="text-center py-6 text-gray-400">
                  Nenhum profissional encontrado.
                </td>
              </tr>
            ) : profissionais.map((p, i) => (
              <tr key={p.id || i} className="hover:bg-gray-50 border-b border-gray-200 even:bg-gray-50/50">
                {COLUNAS.map(col => (
                  <td key={col.key} className="border border-gray-200 px-2 py-1.5 text-center text-xs">
                    {col.key === 'cbo' ? descCbo(p.cbo) : p[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
