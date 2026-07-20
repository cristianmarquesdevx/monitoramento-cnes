import { memo } from 'react';
import { Users, Building2, Stethoscope, UserRound, UsersRound, Tags, Calendar, AlertTriangle, Percent, Clock, CheckCircle, Sparkles } from 'lucide-react';

const ITENS = [
  { key: 'total', label: 'Profissionais', icon: Users, color: 'border-l-[var(--cor-primaria)]', filtro: 'todos' },
  { key: 'unidades', label: 'Unidades', icon: Building2, color: 'border-l-green-500' },
  { key: 'medicos', label: 'Médicos', icon: Stethoscope, color: 'border-l-yellow-400', filtro: 'medicos' },
  { key: 'enfermeiros', label: 'Enfermeiros', icon: UserRound, color: 'border-l-cyan-500', filtro: 'enfermeiros' },
  { key: 'acs', label: 'ACS', icon: UsersRound, color: 'border-l-purple-500', filtro: 'acs' },
  { key: 'dentistas', label: 'Dentistas', icon: Sparkles, color: 'border-l-orange-400', filtro: 'dentistas' },
  { key: 'cbos', label: 'CBOs', icon: Tags, color: 'border-l-teal-400' },
  { key: 'criadosHoje', label: 'Hoje', icon: Calendar, color: 'border-l-pink-500', filtro: 'criadosHoje' },
  { key: 'alertas', label: 'Alertas', icon: AlertTriangle, color: 'border-l-red-500', filtro: 'alertas' },
  { key: 'completude', label: 'Completude', icon: Percent, color: 'border-l-blue-500', suffix: '%' },
  { key: 'pendentes', label: 'Pendentes', icon: Clock, color: 'border-l-yellow-400', filtro: 'pendentes' },
  { key: 'concluidos', label: 'Concluídos', icon: CheckCircle, color: 'border-l-green-500', filtro: 'concluidos' },
];

const KPICards = memo(function KPICards({ kpis, onKpiClick }) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-3">
      {ITENS.map(item => {
        const Icon = item.icon;
        const valor = kpis[item.key];
        const exibe = item.suffix ? `${valor}${item.suffix}` : valor;
        const clicavel = !!onKpiClick && !!item.filtro;
        return (
          <div key={item.key}
            onClick={clicavel ? () => onKpiClick(item.key) : undefined}
            onKeyDown={clicavel ? (e) => { if (e.key === 'Enter' || e.key === ' ') onKpiClick(item.key); } : undefined}
            tabIndex={clicavel ? 0 : undefined}
            role={clicavel ? 'button' : undefined}
            aria-label={clicavel ? `${item.label}: ${exibe} - Clique para ver detalhes` : undefined}
            className={`flex-1 min-w-[120px] bg-white border-l-4 ${item.color} rounded-md px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${clicavel ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:ring-offset-1' : 'cursor-default'}`}
            title={`${item.label}: ${exibe}${clicavel ? ' — Clique para detalhes' : ''}`}>
            <div className="text-gray-500 text-[11px] font-semibold flex items-center gap-1">
              <Icon size={12} /> {item.label}
            </div>
            <div className="text-[var(--cor-primaria)] text-xl font-bold">{exibe}</div>
          </div>
        );
      })}
    </div>
  );
});

export default KPICards;

