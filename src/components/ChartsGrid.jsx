import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Legend
} from 'recharts';
import { Maximize2, BarChart3, TrendingUp, PieChart as PieIcon, Activity, X } from 'lucide-react';

const COLORS = ['#003c7d', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#795548'];

// ─── Custom Tooltips ───────────────────────────────────────────

function CustomTooltip({ active, payload, label, bgColor = '#fff', textColor = '#333' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-xl border border-gray-200 p-3 text-xs min-w-[160px]"
      style={{ background: bgColor, color: textColor }}>
      <p className="font-bold mb-1.5 pb-1 border-b border-gray-200" style={{ color: 'var(--cor-primaria)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
          </span>
          <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-xs min-w-[140px]">
      <p className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.payload.fill || d.color }} />
        <strong className="text-gray-700">{d.name}</strong>
      </p>
      <p className="text-gray-600 mt-1">
        Quantidade: <strong className="text-[var(--cor-primaria)]">{d.value}</strong>
      </p>
      {d.payload.percentil !== undefined && (
        <p className="text-gray-500">
          Percentual: <strong>{d.payload.percentil}%</strong>
        </p>
      )}
    </div>
  );
}

// ─── Chart Card Wrapper ────────────────────────────────────────

function ChartCard({ title, icon: Icon, children, onExpand, color = 'var(--cor-primaria)', expanded = false, darkMode = false }) {
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';

  return (
    <div
      className={`${cardBg} rounded-lg border shadow-sm transition-all duration-300 
        ${expanded
          ? 'fixed inset-4 md:inset-8 z-[9998] overflow-auto'
          : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
        } flex flex-col`}
      style={{ minHeight: expanded ? 'auto' : '280px' }}
    >
      {/* Card Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} color={color} />}
          <h5 className={`text-sm font-bold ${expanded ? 'text-base' : ''}`} style={expanded ? { color } : {}}>
            {title}
          </h5>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onExpand?.(); }}
          className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer
            ${expanded
              ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:scale-110'
              : 'text-gray-400 hover:text-[var(--cor-primaria)] hover:bg-gray-100 hover:scale-110'
            }`}
          title={expanded ? 'Fechar' : 'Expandir'}
          aria-label={expanded ? 'Fechar gráfico expandido' : 'Expandir gráfico'}
        >
          {expanded ? <X size={16} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Card Body */}
      <div className={`flex-1 p-2 ${expanded ? 'p-4 md:p-6' : ''} transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
}

// ─── Chart Skeleton Loading ────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center justify-center h-full p-4">
      <div className="bg-gray-200 rounded w-3/4 h-4 mb-3" />
      <div className="flex items-end gap-2 w-full max-w-md px-4 h-[180px]">
        {Array.from({ length: 8 }).map((_, j) => (
          <div key={j} className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${[60, 75, 45, 80, 55, 70, 50, 65][j % 8]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Expanded Chart Modal Content ──────────────────────────────

function ExpandedChartContent({ type, data, darkMode }) {
  const textColor = darkMode ? 'text-gray-200' : 'text-gray-700';
  const bgCard = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const borderClr = darkMode ? 'border-gray-600' : 'border-gray-200';

  if (type === 'bar') {
    const total = data.reduce((s, d) => s + d.inclusoes + d.alteracoes + d.exclusoes, 0);
    const media = data.length > 0 ? Math.round(total / data.length) : 0;
    const maxMonth = data.reduce((best, d) => {
      const sum = d.inclusoes + d.alteracoes + d.exclusoes;
      return sum > (best.sum || 0) ? { ...d, sum } : best;
    }, {});

    return (
      <div className="space-y-6">
        <div className="h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#666' }} />
              <YAxis tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#666' }} />
              <Tooltip content={<CustomTooltip bgColor={darkMode ? '#1f2937' : '#fff'} textColor={darkMode ? '#f3f4f6' : '#333'} />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: darkMode ? '#d1d5db' : '#666' }} />
              <Bar dataKey="inclusoes" name="Inclusões" fill="#003c7d" radius={[3, 3, 0, 0]} maxBarSize={40} />
              <Bar dataKey="alteracoes" name="Alterações" fill="#28a745" radius={[3, 3, 0, 0]} maxBarSize={40} />
              <Bar dataKey="exclusoes" name="Exclusões" fill="#dc3545" radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${textColor}`}>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Total Geral</p>
            <p className="text-xl font-bold" style={{ color: '#003c7d' }}>{total.toLocaleString()}</p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Média/Mês</p>
            <p className="text-xl font-bold" style={{ color: '#28a745' }}>{media.toLocaleString()}</p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Mês Recorde</p>
            <p className="text-sm font-bold" style={{ color: '#ffc107' }}>
              {maxMonth.mes || '—'} ({maxMonth.sum || 0})
            </p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Período</p>
            <p className="text-sm font-bold">{data.length} meses</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'trend') {
    const values = data.map(d => d.inclusoes);
    const total = values.reduce((s, v) => s + v, 0);
    const media = values.length > 0 ? Math.round(total / values.length) : 0;
    const crescimento = values.length >= 2
      ? ((values[values.length - 1] - values[0]) / (values[0] || 1) * 100).toFixed(1)
      : '0';

    return (
      <div className="space-y-6">
        <div className="h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003c7d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#003c7d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#666' }} />
              <YAxis tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#666' }} />
              <Tooltip content={<CustomTooltip bgColor={darkMode ? '#1f2937' : '#fff'} textColor={darkMode ? '#f3f4f6' : '#333'} />} />
              <Area type="monotone" dataKey="inclusoes" stroke="#003c7d" strokeWidth={2.5}
                fill="url(#trendGradient)" dot={{ r: 3, fill: '#003c7d', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#003c7d', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${textColor}`}>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Total</p>
            <p className="text-xl font-bold" style={{ color: '#003c7d' }}>{total.toLocaleString()}</p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Média</p>
            <p className="text-xl font-bold" style={{ color: '#17a2b8' }}>{media.toLocaleString()}</p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Crescimento</p>
            <p className={`text-xl font-bold ${parseFloat(crescimento) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(crescimento) >= 0 ? '+' : ''}{crescimento}%
            </p>
          </div>
          <div className={`${bgCard} rounded-lg p-3 border ${borderClr} text-center`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Último mês</p>
            <p className="text-xl font-bold" style={{ color: '#6f42c1' }}>
              {data.length > 0 ? data[data.length - 1].inclusoes.toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
      <div className="space-y-6">
        <div className="h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={60} outerRadius={130}
                paddingAngle={2}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                labelLine={{ stroke: '#999', strokeWidth: 1 }}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    stroke={darkMode ? '#1f2937' : '#fff'} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={`overflow-x-auto border ${borderClr} rounded-lg max-h-[250px] overflow-y-auto`}>
          <table className="w-full text-xs">
            <thead className={`sticky top-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">CBO</th>
                <th className="px-3 py-2 text-right">Quantidade</th>
                <th className="px-3 py-2 text-right">Percentual</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className={`border-t ${borderClr} hover:opacity-80`}
                  style={{ borderLeft: `3px solid ${COLORS[i % COLORS.length]}` }}>
                  <td className="px-3 py-1.5 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-1.5 font-medium">{d.name}</td>
                  <td className="px-3 py-1.5 text-right font-bold">{d.value.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-right text-gray-500">
                    {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} font-bold`}>
              <tr className={`border-t-2 ${borderClr}`}>
                <td colSpan={2} className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">{total.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'radar') {
    return (
      <div className="space-y-6">
        <div className="h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
              <PolarAngleAxis dataKey="carga" tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#666' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#666' }} angle={30} domain={[0, 'auto']} />
              <Radar dataKey="valor" stroke="#003c7d" fill="#003c7d" fillOpacity={0.2}
                strokeWidth={2} dot={{ r: 4, fill: '#003c7d', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#003c7d', strokeWidth: 2 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {data.map((d, i) => (
            <div key={i} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 border ${borderClr} text-center`}>
              <p className="text-[10px] uppercase tracking-wider opacity-70">{d.carga}</p>
              <p className="text-lg font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                {d.valor.toLocaleString()} {i === 0 ? 'prof' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main ChartsGrid Component ─────────────────────────────────

export default function ChartsGrid({ chartMensal, chartCBO, chartCarga, darkMode = false }) {
  const [expandedChart, setExpandedChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!chartMensal?.length && !chartCBO?.length && !chartCarga?.length);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [chartMensal, chartCBO, chartCarga]);

  // Close expanded on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setExpandedChart(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
      </div>
    );
  }

  const charts = [
    {
      id: 'bar',
      title: '📊 Movimentação Mensal',
      icon: BarChart3,
      color: '#003c7d',
      component: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartMensal} barGap={1} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#888' }} />
            <Tooltip content={<CustomTooltip bgColor={darkMode ? '#1f2937' : '#fff'} textColor={darkMode ? '#f3f4f6' : '#333'} />} />
            <Legend wrapperStyle={{ fontSize: '10px', color: darkMode ? '#d1d5db' : '#666' }} />
            <Bar dataKey="inclusoes" name="Inclusões" fill="#003c7d" radius={[2, 2, 0, 0]} maxBarSize={28} />
            <Bar dataKey="alteracoes" name="Alterações" fill="#28a745" radius={[2, 2, 0, 0]} maxBarSize={28} />
            <Bar dataKey="exclusoes" name="Exclusões" fill="#dc3545" radius={[2, 2, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      ),
      expandedData: chartMensal,
    },
    {
      id: 'trend',
      title: '📈 Tendência com Área',
      icon: TrendingUp,
      color: '#17a2b8',
      component: (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartMensal}>
            <defs>
              <linearGradient id="colorIncl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003c7d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#003c7d" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#888' }} />
            <Tooltip content={<CustomTooltip bgColor={darkMode ? '#1f2937' : '#fff'} textColor={darkMode ? '#f3f4f6' : '#333'} />} />
            <Area type="monotone" dataKey="inclusoes" stroke="#003c7d" strokeWidth={2}
              fill="url(#colorIncl)" dot={{ r: 2.5, fill: '#003c7d', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#003c7d', strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      ),
      expandedData: chartMensal,
    },
    {
      id: 'pie',
      title: '🥧 CBO (Top 10)',
      icon: PieIcon,
      color: '#6f42c1',
      component: (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartCBO} dataKey="value" nameKey="name"
              cx="50%" cy="50%" innerRadius={40} outerRadius={70}
              paddingAngle={2}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {chartCBO.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]}
                  stroke={darkMode ? '#1f2937' : '#fff'} strokeWidth={1.5} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      ),
      expandedData: chartCBO,
    },
    {
      id: 'radar',
      title: '🕐 Carga Horária',
      icon: Activity,
      color: '#e83e8c',
      component: (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartCarga}>
            <PolarGrid stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
            <PolarAngleAxis dataKey="carga" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#888' }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: darkMode ? '#9ca3af' : '#888' }} angle={30} domain={[0, 'auto']} />
            <Radar dataKey="valor" stroke="#003c7d" fill="#003c7d" fillOpacity={0.2}
              strokeWidth={2} dot={{ r: 3, fill: '#003c7d', strokeWidth: 1.5, stroke: '#fff' }} />
            <Tooltip content={<CustomTooltip bgColor={darkMode ? '#1f2937' : '#fff'} textColor={darkMode ? '#f3f4f6' : '#333'} />} />
          </RadarChart>
        </ResponsiveContainer>
      ),
      expandedData: chartCarga,
    },
  ];

  return (
    <>
      {/* Expanded Chart Overlay */}
      {expandedChart && (
        <div
          className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.25s_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setExpandedChart(null); }}
        >
          <div className="w-full max-w-5xl max-h-[90vh] animate-[scaleIn_0.3s_ease-out]">
            <ChartCard
              title={(expandedChart.title || '').replace(/^[^\w\s]{1,2}\s/, '') + ' — Detalhado'}
              icon={expandedChart.icon}
              color={expandedChart.color}
              onExpand={() => setExpandedChart(null)}
              expanded={true}
              darkMode={darkMode}
            >
              <ExpandedChartContent
                type={expandedChart.id}
                data={expandedChart.expandedData}
                darkMode={darkMode}
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {charts.map((chart) => (
          <div
            key={chart.id}
            onClick={() => setExpandedChart(chart)}
            className="transition-all duration-300"
          >
            <ChartCard
              title={chart.title}
              icon={chart.icon}
              color={chart.color}
              onExpand={() => setExpandedChart(chart)}
              darkMode={darkMode}
            >
              <div className="w-full h-[200px] md:h-[220px]">
                {chart.component}
              </div>
            </ChartCard>
          </div>
        ))}
      </div>
    </>
  );
}
