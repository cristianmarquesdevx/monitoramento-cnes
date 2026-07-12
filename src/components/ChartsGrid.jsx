import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#003c7d', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

export default function ChartsGrid({ chartMensal, chartCBO, chartCarga }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {/* Bar Chart - Mov. Mensal */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-300 dark:border-gray-700 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">📊 Mov. Mensal</h5>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartMensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
            <Bar dataKey="inclusoes" fill="#003c7d" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Tendência Semanal */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-300 dark:border-gray-700 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">📈 Tendência Semanal</h5>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartMensal.slice(-8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
            <Line type="monotone" dataKey="inclusoes" stroke="#003c7d" strokeWidth={2} dot={{ fill: '#003c7d' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - CBO (Top 10) */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-300 dark:border-gray-700 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">🥧 CBO (Top 10)</h5>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={chartCBO} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
              {chartCBO.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Carga Horária */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-300 dark:border-gray-700 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">🕐 Carga Horária</h5>
        <ResponsiveContainer width="100%" height="85%">
          <RadarChart data={chartCarga}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="carga" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Radar dataKey="valor" stroke="#003c7d" fill="#003c7d" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
