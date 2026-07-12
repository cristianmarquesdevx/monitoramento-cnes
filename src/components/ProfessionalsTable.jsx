import { CheckCircle2 } from 'lucide-react';

function isNovo(createdAt) {
  if (!createdAt) return false;
  const horas72 = 72 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() < horas72;
}

export default function ProfessionalsTable({
  profissionaisFiltrados,
  onMarcarConcluido,
  getCboDesc
}) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800">
      {/* Mobile card view for small screens */}
      <div className="block lg:hidden space-y-2 p-2">
        {profissionaisFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl opacity-30 mb-2">👻</div>
            Nenhum profissional encontrado.
          </div>
        ) : profissionaisFiltrados.map((p, i) => {
          const novo = isNovo(p.created_at) && !p.controle_concluido;
          return (
            <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-3 shadow-sm ${p.controle_concluido ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-500 dark:text-gray-400">#{i + 1}</span>
                  {novo && (
                    <span className="inline-flex items-center gap-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300 dark:border-green-600">
                      <CheckCircle2 size={10} /> Novo
                    </span>
                  )}
                </div>
                <input type="checkbox" checked={!!p.controle_concluido}
                  onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                  className="w-5 h-5 cursor-pointer" title={p.controle_concluido ? 'Concluído' : 'Marcar como concluído'} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div><span className="text-gray-500 dark:text-gray-400">Nome:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.nome_profissional || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">CPF:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.cpf || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">CNES:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.cnes || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">CBO:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{getCboDesc(p.cbo)}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Conselho:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.conselho || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Registro:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.registro || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Cargo:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.cargo_funcao || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Vínculo:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.tipo_vinculo || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">C.H.:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.carga_horaria || '—'}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Setor:</span> <span className="font-bold text-gray-800 dark:text-gray-100">{p.setor_equipe || '—'}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <table className="w-full border-collapse min-w-[1000px] hidden lg:table">
        <thead>
          <tr className="bg-[var(--cor-primaria-claro)] dark:bg-[#003c7d]/30">
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Controle</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Nº</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Unidade</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Nome</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">CPF</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">CBO</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Conselho</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Registro</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">UF</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Cargo</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Vínculo</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">C.H.</th>
            <th className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] text-gray-800 dark:text-gray-100">Setor</th>
          </tr>
        </thead>
        <tbody>
          {profissionaisFiltrados.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl opacity-30 mb-2">👻</div>
                Nenhum profissional encontrado.
              </td>
            </tr>
          ) : profissionaisFiltrados.map((p, i) => {
            const novo = isNovo(p.created_at) && !p.controle_concluido;
            return (
              <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${p.controle_concluido ? 'opacity-70' : ''}`}>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">
                  <div className="flex items-center justify-center gap-1">
                    {novo && (
                      <span className="inline-flex items-center gap-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300 dark:border-green-600 whitespace-nowrap">
                        <CheckCircle2 size={10} />
                        Novo
                      </span>
                    )}
                    <input type="checkbox" checked={!!p.controle_concluido}
                      onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer" title={p.controle_concluido ? 'Concluído' : 'Marcar como concluído'} />
                  </div>
                </td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{i + 1}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.cnes || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.nome_profissional || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.cpf || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{getCboDesc(p.cbo)}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.conselho || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.registro || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.uf_conselho || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.cargo_funcao || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.tipo_vinculo || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.carga_horaria || ''}</td>
                <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold text-gray-800 dark:text-gray-100">{p.setor_equipe || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
