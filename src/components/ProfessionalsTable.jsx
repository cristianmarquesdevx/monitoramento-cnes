import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';

function isNovo(createdAt) {
  if (!createdAt) return false;
  const horas72 = 72 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() < horas72;
}

function ProfessionalsTable({
  profissionaisFiltrados,
  onMarcarConcluido,
  getCboDesc,
  paginaAtual = 1
}) {
  return (
    <div className="overflow-x-auto bg-white">
      {/* Mobile card view for small screens */}
      <div className="block lg:hidden space-y-2 p-2">
        {profissionaisFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl opacity-30 mb-2">👻</div>
            Nenhum profissional encontrado.
          </div>
        ) : profissionaisFiltrados.map((p, i) => {
          const novo = isNovo(p.created_at) && !p.controle_feito;
          return (
            <div key={p.id} className={`bg-white rounded-lg border border-gray-300 p-3 shadow-sm ${p.controle_feito ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-500">#{(paginaAtual - 1) * 50 + i + 1}</span>
                  {novo && (
                    <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300">
                      <CheckCircle2 size={10} /> Novo
                    </span>
                  )}
                </div>
                <input type="checkbox" checked={!!p.controle_feito}
                  onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                  className="w-5 h-5 cursor-pointer" title={p.controle_feito ? 'Concluído' : 'Marcar como concluído'} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div><span className="text-gray-500">Nome:</span> <span className="font-bold">{p.nome_profissional || '—'}</span></div>
                <div><span className="text-gray-500">CPF:</span> <span className="font-bold">{p.cpf || '—'}</span></div>
                <div><span className="text-gray-500">CNS:</span> <span className="font-bold">{p.cns || '—'}</span></div>
                <div><span className="text-gray-500">CNES:</span> <span className="font-bold">{p.cnes || '—'}</span></div>
                <div><span className="text-gray-500">CBO:</span> <span className="font-bold">{getCboDesc(p.cbo)}</span></div>
                <div><span className="text-gray-500">Conselho:</span> <span className="font-bold">{p.conselho || '—'}</span></div>
                <div><span className="text-gray-500">Registro:</span> <span className="font-bold">{p.registro || '—'}</span></div>
                <div><span className="text-gray-500">Cargo:</span> <span className="font-bold">{p.cargo_funcao || '—'}</span></div>
                <div><span className="text-gray-500">Vínculo:</span> <span className="font-bold">{p.tipo_vinculo || '—'}</span></div>
                <div><span className="text-gray-500">C.H.:</span> <span className="font-bold">{p.carga_horaria || '—'}</span></div>
                <div><span className="text-gray-500">Setor:</span> <span className="font-bold">{p.setor_equipe || '—'}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <table className="w-full border-collapse min-w-[1000px] hidden lg:table">
        <thead>
          <tr className="bg-[var(--cor-primaria-claro)] text-center">
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Controle</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Nº</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Unidade</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Nome</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">CPF</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">CNS</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">CBO</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Conselho</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Registro</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">UF</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Cargo</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Vínculo</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">C.H.</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Setor</th>
          </tr>
        </thead>
        <tbody>
          {profissionaisFiltrados.length === 0 ? (
            <tr>
              <td colSpan={14} className="text-center py-8 text-gray-500">
                <div className="text-4xl opacity-30 mb-2">👻</div>
                Nenhum profissional encontrado.
              </td>
            </tr>
          ) : profissionaisFiltrados.map((p, i) => {
            const novo = isNovo(p.created_at) && !p.controle_feito;
            return (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.controle_feito ? 'opacity-70' : ''}`}>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">
                  <div className="flex items-center justify-center gap-1">
                    {novo && (
                      <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300 whitespace-nowrap">
                        <CheckCircle2 size={10} />
                        Novo
                      </span>
                    )}
                    <input type="checkbox" checked={!!p.controle_feito}
                      onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer" title={p.controle_feito ? 'Concluído' : 'Marcar como concluído'} />
                  </div>
                </td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{(paginaAtual - 1) * 50 + i + 1}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.cnes || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold">{p.nome_profissional || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.cpf || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.cns || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{getCboDesc(p.cbo)}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.conselho || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.registro || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.uf_conselho || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold">{p.cargo_funcao || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.tipo_vinculo || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.carga_horaria || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold">{p.setor_equipe || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProfessionalsTable);
