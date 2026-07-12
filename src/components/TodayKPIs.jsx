import { PlusCircle, Edit3, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ITENS = [
  { key: 'inclusoesHoje', label: 'Inclusões hoje', icon: PlusCircle, color: 'text-green-600 bg-green-50 border-green-300' },
  { key: 'alteracoesHoje', label: 'Alterações hoje', icon: Edit3, color: 'text-blue-600 bg-blue-50 border-blue-300' },
  { key: 'exclusoesHoje', label: 'Exclusões hoje', icon: Trash2, color: 'text-red-600 bg-red-50 border-red-300' },
  { key: 'pendentesHoje', label: 'Pendentes hoje', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
  { key: 'aprovadosHoje', label: 'Aprovados hoje', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
  { key: 'alertasCriticos', label: 'Alertas críticos', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-300' },
];

export default function TodayKPIs({ stats, onKpiClick }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {ITENS.map(item => {
        const Icon = item.icon;
        const valor = stats[item.key] ?? 0;
        const clicavel = !!onKpiClick;
        return (
          <div key={item.key}
            onClick={clicavel ? () => onKpiClick(item.key) : undefined}
            onKeyDown={clicavel ? (e) => { if (e.key === 'Enter' || e.key === ' ') onKpiClick(item.key); } : undefined}
            tabIndex={clicavel ? 0 : undefined}
            role={clicavel ? 'button' : undefined}
            aria-label={clicavel ? `${item.label}: ${valor} - Clique para ver detalhes` : undefined}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold ${item.color} ${clicavel ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:ring-offset-1' : ''}`}
            title={`${item.label}: ${valor}${clicavel ? ' — Clique para detalhes' : ''}`}>
            <Icon size={12} />
            <span>{item.label}</span>
            <span className="ml-0.5 font-bold text-sm">{valor}</span>
          </div>
        );
      })}
    </div>
  );
}
