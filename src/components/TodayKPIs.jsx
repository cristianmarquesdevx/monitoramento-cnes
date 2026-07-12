import { PlusCircle, Edit3, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ITENS = [
  { key: 'inclusoesHoje', label: 'Inclusões hoje', icon: PlusCircle, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' },
  { key: 'alteracoesHoje', label: 'Alterações hoje', icon: Edit3, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' },
  { key: 'exclusoesHoje', label: 'Exclusões hoje', icon: Trash2, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' },
  { key: 'pendentesHoje', label: 'Pendentes hoje', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' },
  { key: 'aprovadosHoje', label: 'Aprovados hoje', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' },
  { key: 'alertasCriticos', label: 'Alertas críticos', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' },
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold ${item.color} ${clicavel ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:ring-offset-1 dark:focus:ring-offset-gray-900' : ''}`}
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
