export default function ProfessionalsTable({
  profissionaisFiltrados,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onMarcarConcluido,
  getCboDesc
}) {
  const todosSelecionados = profissionaisFiltrados.length > 0 && selectedIds.size === profissionaisFiltrados.length;

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-[var(--cor-primaria-claro)] text-center">
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] w-[50px]">
              <input type="checkbox" checked={todosSelecionados}
                onChange={e => onToggleAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
            </th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Controle</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Nº</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Unidade</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">Nome</th>
            <th className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">CPF</th>
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
          ) : profissionaisFiltrados.map((p, i) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">
                <input type="checkbox" checked={selectedIds.has(p.id)}
                  onChange={e => onToggleSelect(p.id, e.target.checked)} className="w-4 h-4 cursor-pointer" />
              </td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">
                <input type="checkbox" checked={!!p.controle_concluido}
                  onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                  className="w-4 h-4 cursor-pointer" title="Marcar como concluído" />
              </td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{i + 1}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.cnes || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">{p.nome_profissional || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.cpf || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{getCboDesc(p.cbo)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.conselho || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.registro || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.uf_conselho || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">{p.cargo_funcao || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.tipo_vinculo || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">{p.carga_horaria || ''}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)]">{p.setor_equipe || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
