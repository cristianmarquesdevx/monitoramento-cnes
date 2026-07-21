import { memo, useId } from 'react';
import { CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';

function isNovo(createdAt) {
  if (!createdAt) return false;
  const horas72 = 72 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() < horas72;
}

function SortIcon({ field, sortFields }) {
  const idx = sortFields.findIndex(s => s.field === field);
  if (idx === -1) {
    return <span className="inline-block ml-0.5 opacity-20 group-hover:opacity-60 transition-opacity">↕</span>;
  }
  const s = sortFields[idx];
  const arrow = s.dir === 'asc' ? '▲' : '▼';
  return (
    <span className="inline-flex items-center ml-0.5 text-white gap-0.5">
      {sortFields.length > 1 && <span className="text-[10px] font-bold">{idx + 1}</span>}
      <span>{arrow}</span>
    </span>
  );
}

function SortTh({ children, field, sortFields, onSort }) {
  const isActive = sortFields.some(s => s.field === field);
  const hint = sortFields.length > 0 ? 'Shift+Click para adicionar' : '';
  return (
    <th
      onClick={e => onSort(field, e.shiftKey)}
      className={`border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] cursor-pointer select-none group hover:bg-[var(--cor-primaria)] hover:text-white transition-colors ${isActive ? 'bg-[var(--cor-primaria)] text-white' : ''}`}
      title={`Ordenar por ${children}${hint ? ` · ${hint}` : ''}`}
    >
      <span className="inline-flex items-center justify-center">
        {children}
        <SortIcon field={field} sortFields={sortFields} />
      </span>
    </th>
  );
}

function ProfessionalsTable({
  profissionaisFiltrados,
  onMarcarConcluido,
  getCboDesc,
  paginaAtual = 1,
  itensPorPagina = 50,
  sortFields = [],
  onSort
}) {
  const selectId = useId();
  const colunasMobile = [
    { field: 'nome_profissional', label: 'Nome' },
    { field: 'cnes', label: 'Unidade' },
    { field: 'cpf', label: 'CPF' },
    { field: 'cns', label: 'CNS' },
    { field: 'cbo', label: 'CBO' },
    { field: 'conselho', label: 'Conselho' },
    { field: 'registro', label: 'Registro' },
    { field: 'uf_conselho', label: 'UF' },
    { field: 'cargo_funcao', label: 'Cargo' },
    { field: 'tipo_vinculo', label: 'Vínculo' },
    { field: 'carga_horaria', label: 'C.H.' },
    { field: 'setor_equipe', label: 'Setor' },
  ];

  return (
    <div className="overflow-x-auto bg-white">
      {/* Mobile card view for small screens */}
      <div className="block lg:hidden p-2">
        {/* Sort controls for mobile */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 flex-1">
            <label htmlFor={selectId} className="text-xs font-bold text-gray-500 whitespace-nowrap">Ordenar:</label>
            <select
              id={selectId}
              value={sortFields[0]?.field || ''}
              onChange={e => onSort(e.target.value, false)}
              className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white cursor-pointer"
            >
              <option value="" disabled>Selecionar...</option>
              {colunasMobile.map(col => (
                <option key={col.field} value={col.field}>{col.label}</option>
              ))}
            </select>
          </div>
          {sortFields.length > 0 && (
            <button
              onClick={() => onSort(sortFields[0].field, false)}
              className="px-2 py-1.5 rounded text-xs font-bold border border-gray-300 bg-white cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1"
              title={sortFields[0]?.dir === 'asc' ? 'Ordem crescente — clique para inverter' : 'Ordem decrescente — clique para inverter'}
            >
              {sortFields[0]?.dir === 'asc' ? <ArrowUp size={14} className="text-[var(--cor-primaria)]" /> : <ArrowDown size={14} className="text-[var(--cor-primaria)]" />}
              <span className="text-gray-600">{sortFields[0]?.dir === 'asc' ? 'A→Z' : 'Z→A'}</span>
            </button>
          )}
          {sortFields.length === 0 && (
            <span className="text-[10px] text-gray-400 italic">Selecione uma coluna acima</span>
          )}
        </div>

        <div className="space-y-2">
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
                  <span className="font-bold text-sm text-gray-500">#{(paginaAtual - 1) * itensPorPagina + i + 1}</span>
                  {novo && (
                    <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300">
                      <CheckCircle2 size={10} /> Novo
                    </span>
                  )}
                </div>
                <input type="checkbox" checked={!!p.controle_feito}
                  onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                  className="w-6 h-6 cursor-pointer min-w-[24px]" title={p.controle_feito ? 'Concluído' : 'Marcar como concluído'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
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
            <SortTh field="cnes" sortFields={sortFields} onSort={onSort}>Unidade</SortTh>
            <SortTh field="nome_profissional" sortFields={sortFields} onSort={onSort}>Nome</SortTh>
            <SortTh field="cpf" sortFields={sortFields} onSort={onSort}>CPF</SortTh>
            <SortTh field="cns" sortFields={sortFields} onSort={onSort}>CNS</SortTh>
            <SortTh field="cbo" sortFields={sortFields} onSort={onSort}>CBO</SortTh>
            <SortTh field="conselho" sortFields={sortFields} onSort={onSort}>Conselho</SortTh>
            <SortTh field="registro" sortFields={sortFields} onSort={onSort}>Registro</SortTh>
            <SortTh field="uf_conselho" sortFields={sortFields} onSort={onSort}>UF</SortTh>
            <SortTh field="cargo_funcao" sortFields={sortFields} onSort={onSort}>Cargo</SortTh>
            <SortTh field="tipo_vinculo" sortFields={sortFields} onSort={onSort}>Vínculo</SortTh>
            <SortTh field="carga_horaria" sortFields={sortFields} onSort={onSort}>C.H.</SortTh>
            <SortTh field="setor_equipe" sortFields={sortFields} onSort={onSort}>Setor</SortTh>
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
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{(paginaAtual - 1) * itensPorPagina + i + 1}</td>
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
