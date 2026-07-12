import { CheckCircle2 } from 'lucide-react';

function isNovo(createdAt) {
  if (!createdAt) return false;
  const seteDias = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() < seteDias;
}

export default function ProfessionalsTable({
  profissionaisFiltrados,
  onMarcarConcluido,
  getCboDesc
}) {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-[var(--cor-primaria-claro)] text-center">
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
              <td colSpan={13} className="text-center py-8 text-gray-500">
                <div className="text-4xl opacity-30 mb-2">👻</div>
                Nenhum profissional encontrado.
              </td>
            </tr>
          ) : profissionaisFiltrados.map((p, i) => {
            const novo = isNovo(p.created_at);
            return (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.controle_concluido ? 'opacity-70' : ''}`}>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)]">
                  <div className="flex items-center justify-center gap-1">
                    {novo && (
                      <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-300 whitespace-nowrap">
                        <CheckCircle2 size={10} />
                        Novo
                      </span>
                    )}
                    <input type="checkbox" checked={!!p.controle_concluido}
                      onChange={e => onMarcarConcluido(p.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer" title={p.controle_concluido ? 'Concluído' : 'Marcar como concluído'} />
                  </div>
                </td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{i + 1}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.cnes || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-[clamp(11px,1.6vw,13px)] font-bold">{p.nome_profissional || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center text-[clamp(11px,1.6vw,13px)] font-bold">{p.cpf || ''}</td>
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
