import { useState, useMemo } from 'react';
import Modal from './Modal';
import { listaCBO } from '../data/cboData';
import { FileText, Download, Search, Printer } from 'lucide-react';

const TIPOS_RELATORIO = [
  { value: 'lista_unidade', label: '📋 Lista de Profissionais por Unidade' },
  { value: 'resumo_unidade', label: '📊 Resumo por Unidade' },
  { value: 'profissionais_cbo', label: '👨‍⚕️ Profissionais por CBO' },
  { value: 'alertas', label: '⚠️ Alertas (sem CBO/CPF)' },
  { value: 'movimentacao', label: '📈 Movimentação Mensal' },
  { value: 'vinculo', label: '🤝 Profissionais por Vínculo' },
  { value: 'controle', label: '✅ Controle (Concluídos × Pendentes)' },
  { value: 'completude', label: '🎯 Completude Cadastral' },
];

function formatCbo(codigo) {
  if (!codigo) return '—';
  const cbo = listaCBO.find(c => c.codigo === codigo);
  return cbo ? `${cbo.codigo} - ${cbo.descricao}` : codigo;
}

function nomeUnidade(cnes, unidades) {
  if (!cnes) return '—';
  const u = unidades.find(uni => uni.cnes === cnes);
  return u ? `${u.cnes} - ${u.nome_unidade}` : cnes;
}

export default function ReportsModal({ isOpen, onClose, profissionais, unidades, solicitacoes }) {
  const [tipoRelatorio, setTipoRelatorio] = useState('lista_unidade');
  const [cnesFiltro, setCnesFiltro] = useState('__todos__');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [gerado, setGerado] = useState(false);

  const resultados = useMemo(() => {
    if (!gerado) return null;

    const hoje = new Date().toISOString().split('T')[0];
    const inicio = dataInicio || '2000-01-01';
    const fim = dataFim || hoje;

    const profissionaisFiltrados = cnesFiltro === '__todos__'
      ? [...profissionais]
      : profissionais.filter(p => p.cnes === cnesFiltro);

    const noPeriodo = (data) => data && data >= inicio && data <= fim + 'T23:59:59';

    switch (tipoRelatorio) {
      case 'lista_unidade': {
        const rows = profissionaisFiltrados.map(p => ({
          unidade: nomeUnidade(p.cnes, unidades),
          nome: p.nome_profissional || '—',
          cpf: p.cpf || '—',
          cbo: formatCbo(p.cbo),
          conselho: p.conselho || '—',
          registro: p.registro || '—',
          cargo: p.cargo_funcao || '—',
          vinculo: p.tipo_vinculo || '—',
          carga: p.carga_horaria || '—',
          setor: p.setor_equipe || '—',
        }));
        return { titulo: 'Lista de Profissionais', cabecalho: ['Unidade', 'Nome', 'CPF', 'CBO', 'Conselho', 'Registro', 'Cargo', 'Vínculo', 'C.H.', 'Setor'], rows };
      }

      case 'resumo_unidade': {
        const contagem = {};
        profissionais.forEach(p => {
          const key = nomeUnidade(p.cnes, unidades);
          contagem[key] = (contagem[key] || 0) + 1;
        });
        const rows = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])
          .map(([unidade, total]) => ({ unidade, total }));
        return { titulo: 'Resumo por Unidade', cabecalho: ['Unidade', 'Total Profissionais'], rows };
      }

      case 'profissionais_cbo': {
        const contagem = {};
        profissionaisFiltrados.forEach(p => {
          if (p.cbo) {
            const desc = formatCbo(p.cbo);
            contagem[desc] = (contagem[desc] || 0) + 1;
          }
        });
        const rows = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])
          .map(([cbo, total]) => ({ cbo, total }));
        return { titulo: 'Profissionais por CBO', cabecalho: ['CBO', 'Total'], rows };
      }

      case 'alertas': {
        const rows = profissionaisFiltrados
          .filter(p => !p.cbo || !p.cpf)
          .map(p => ({
            nome: p.nome_profissional || '—',
            cpf: p.cpf || '⚠️ Faltando',
            cbo: p.cbo ? formatCbo(p.cbo) : '⚠️ Faltando',
            unidade: nomeUnidade(p.cnes, unidades),
          }));
        return { titulo: 'Alertas - Profissionais com dados incompletos', cabecalho: ['Nome', 'CPF', 'CBO', 'Unidade'], rows };
      }

      case 'movimentacao': {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = meses.map(m => ({ mes: m, inclusoes: 0, alteracoes: 0, exclusoes: 0 }));
        profissionaisFiltrados.forEach(p => {
          if (p.created_at && noPeriodo(p.created_at)) {
            const m = new Date(p.created_at).getMonth();
            dados[m].inclusoes++;
          }
        });
        solicitacoes.forEach(s => {
          if (s.criado_em && noPeriodo(s.criado_em)) {
            const m = new Date(s.criado_em).getMonth();
            if (s.tipo === 'update') dados[m].alteracoes++;
            else if (s.tipo === 'delete') dados[m].exclusoes++;
          }
        });
        const rows = dados.map(d => ({
          mes: d.mes, inclusoes: d.inclusoes, alteracoes: d.alteracoes, exclusoes: d.exclusoes, total: d.inclusoes + d.alteracoes + d.exclusoes
        }));
        return { titulo: 'Movimentação Mensal', cabecalho: ['Mês', 'Inclusões', 'Alterações', 'Exclusões', 'Total'], rows };
      }

      case 'vinculo': {
        const contagem = {};
        profissionaisFiltrados.forEach(p => {
          const v = p.tipo_vinculo || 'Não informado';
          contagem[v] = (contagem[v] || 0) + 1;
        });
        const rows = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])
          .map(([vinculo, total]) => ({ vinculo, total }));
        return { titulo: 'Profissionais por Vínculo', cabecalho: ['Tipo Vínculo', 'Total'], rows };
      }

      case 'controle': {
        const concluidos = profissionaisFiltrados.filter(p => p.controle_feito).length;
        const pendentes = profissionaisFiltrados.length - concluidos;
        return {
          titulo: 'Controle',
          cabecalho: ['Status', 'Quantidade', '%'],
          rows: [
            { status: 'Concluídos', quantidade: concluidos, pct: profissionaisFiltrados.length > 0 ? ((concluidos / profissionaisFiltrados.length) * 100).toFixed(1) : '0' },
            { status: 'Pendentes', quantidade: pendentes, pct: profissionaisFiltrados.length > 0 ? ((pendentes / profissionaisFiltrados.length) * 100).toFixed(1) : '0' },
            { status: 'Total', quantidade: profissionaisFiltrados.length, pct: '100' },
          ]
        };
      }

      case 'completude': {
        const total = profissionaisFiltrados.length;
        const comCBO = profissionaisFiltrados.filter(p => p.cbo).length;
        const comCPF = profissionaisFiltrados.filter(p => p.cpf).length;
        const completo = profissionaisFiltrados.filter(p => p.cbo && p.cpf).length;
        return {
          titulo: 'Completude Cadastral',
          cabecalho: ['Indicador', 'Quantidade', '%'],
          rows: [
            { indicador: 'Total de profissionais', quantidade: total, pct: '100' },
            { indicador: 'Com CBO preenchido', quantidade: comCBO, pct: total > 0 ? ((comCBO / total) * 100).toFixed(1) : '0' },
            { indicador: 'Com CPF preenchido', quantidade: comCPF, pct: total > 0 ? ((comCPF / total) * 100).toFixed(1) : '0' },
            { indicador: 'Completo (CBO + CPF)', quantidade: completo, pct: total > 0 ? ((completo / total) * 100).toFixed(1) : '0' },
          ]
        };
      }

      default:
        return null;
    }
  }, [gerado, tipoRelatorio, cnesFiltro, dataInicio, dataFim, profissionais, unidades, solicitacoes]);

  const exportarCSV = () => {
    if (!resultados) return;
    const keys = Object.keys(resultados.rows[0] || {});
    const header = resultados.cabecalho.join(',');
    const rows = resultados.rows.map(row =>
      keys.map(k => {
        const val = row[k] ?? '';
        return `"${val}"`;
      }).join(',')
    );
    const blob = new Blob(['\uFEFF' + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📄 Relatórios" maxWidth="max-w-[1100px]">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Relatório</label>
          <select value={tipoRelatorio} onChange={e => { setTipoRelatorio(e.target.value); setGerado(false); }}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
            {TIPOS_RELATORIO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Unidade</label>
          <select value={cnesFiltro} onChange={e => { setCnesFiltro(e.target.value); setGerado(false); }}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
            <option value="__todos__">Todas as unidades</option>
            {unidades.map(u => (
              <option key={u.cnes} value={u.cnes}>{u.cnes} - {u.nome_unidade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Data Início</label>
          <input type="date" value={dataInicio} onChange={e => { setDataInicio(e.target.value); setGerado(false); }}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Data Fim</label>
          <input type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); setGerado(false); }}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </div>
      </div>

      {/* Botão Gerar */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setGerado(true)}
          className="flex items-center gap-1.5 bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-hover)] text-white px-4 py-2 rounded text-sm font-bold cursor-pointer transition-all">
          <Search size={16} /> Gerar Relatório
        </button>
        {resultados && resultados.rows.length > 0 && (
          <>
          <button onClick={exportarCSV}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold cursor-pointer transition-all">
            <Download size={16} /> Exportar CSV
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold cursor-pointer transition-all">
            <Printer size={16} /> Imprimir / PDF
          </button>
          </>
        )}
      </div>

      {/* Resultados */}
      {resultados && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700">
              <FileText size={14} className="inline mr-1" /> {resultados.titulo}
              <span className="font-normal text-gray-500 ml-2">({resultados.rows.length} registros)</span>
            </p>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[450px] overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--cor-primaria-claro)] text-center text-xs font-bold uppercase text-gray-700">
                  <th className="border border-gray-300 px-2 py-2 w-10">#</th>
                  {resultados.cabecalho.map(col => (
                    <th key={col} className="border border-gray-300 px-2 py-2 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.rows.length === 0 ? (
                  <tr><td colSpan={resultados.cabecalho.length + 1} className="text-center py-8 text-gray-400">Nenhum resultado encontrado.</td></tr>
                ) : resultados.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b border-gray-200 even:bg-gray-50/50">
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-xs text-gray-400">{i + 1}</td>
                    {resultados.cabecalho.map(col => {
                      const key = Object.keys(row)[resultados.cabecalho.indexOf(col)];
                      return (
                        <td key={col} className="border border-gray-200 px-2 py-1.5 text-center text-xs">
                          {row[key] || '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}
