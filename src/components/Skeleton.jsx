/* ────────────── Pulso animado ────────────── */
function Pulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ────────────── KPI Card Skeleton ────────────── */
export function KPISkeleton() {
  return (
    <div className="flex-1 min-w-[120px] bg-white border-l-4 border-l-gray-200 rounded-md px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-1 mb-1.5">
        <Pulse className="w-3 h-3" />
        <Pulse className="h-2.5 w-16" />
      </div>
      <Pulse className="h-6 w-12 mt-1" />
    </div>
  );
}

/* ────────────── Chart Skeleton ────────────── */
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-md p-3 border border-gray-300 h-[200px] flex flex-col">
      <Pulse className="h-3.5 w-28 mb-2" />
      <div className="flex-1 flex items-end gap-1.5 px-2 pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Pulse
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${[60,75,45,80,55,70,50,65][i]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────────── Table Row Skeleton ────────────── */
export function TableRowSkeleton({ cols = 14 }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="border border-gray-200 px-2 py-2.5">
          <Pulse className={`h-3.5 ${i < 2 ? 'w-4 mx-auto' : i === 4 ? 'w-3/4' : i === 6 ? 'w-2/3' : 'w-3/5 mx-auto'}`} />
        </td>
      ))}
    </tr>
  );
}

/* ────────────── Multi-lotação Skeleton ────────────── */
export function MultiLotacaoSkeleton() {
  return (
    <div className="bg-white rounded-md p-2.5 border border-gray-300 mb-2 max-h-[160px] overflow-y-auto">
      <Pulse className="h-3 w-48 mb-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <Pulse className="h-2.5 w-44" />
          <Pulse className="h-4 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ────────────── Alertas Skeleton ────────────── */
export function AlertasSkeleton() {
  return (
    <div className="bg-white rounded-md p-2.5 border border-gray-300 mb-2">
      <Pulse className="h-3 w-28 mb-2" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 px-2 mb-0.5 border-l-4 border-l-gray-200">
          <Pulse className="h-2 w-3/4" />
        </div>
      ))}
    </div>
  );
}

/* ────────────── Solicitacoes Skeleton ────────────── */
export function SolicitacoesSkeleton() {
  return (
    <div className="bg-white rounded-md p-2.5 border border-gray-300 max-h-[180px] overflow-y-auto">
      <Pulse className="h-3 w-36 mb-2" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex-1">
            <Pulse className="h-2.5 w-2/3 mb-1" />
            <Pulse className="h-2 w-1/3" />
          </div>
          <div className="flex gap-1 ml-2">
            <Pulse className="h-5 w-14 rounded-full" />
            <Pulse className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────── Loading State Combinado ────────────── */
export default function LoadingSkeleton() {
  return (
    <>
      {/* KPIs */}
      <div className="flex flex-wrap gap-2.5 mb-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>

      {/* Multi-lotação */}
      <MultiLotacaoSkeleton />

      {/* Alertas */}
      <AlertasSkeleton />

      {/* Tabela - cabeçalho + 5 linhas */}
      <div className="bg-white border-t border-gray-200 mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {Array.from({ length: 14 }).map((_, i) => (
                <th key={i} className="border border-gray-200 px-2 py-2.5">
                  <Pulse className="h-3 w-10 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="text-center py-4 text-xs text-gray-300">
        <Pulse className="h-3 w-64 mx-auto mb-1" />
        <Pulse className="h-2.5 w-48 mx-auto" />
      </div>
    </>
  );
}
