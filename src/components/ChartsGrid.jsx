import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#003c7d', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

export default function ChartsGrid({ chartMensal, chartCBO, chartCarga }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {/* Bar Chart - Mov. Mensal */}
      <div className="bg-white rounded-md p-3 border border-gray-300 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700">📊 Mov. Mensal</h5>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="inclusoes" fill="#003c7d" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Tendência Semanal */}
      <div className="bg-white rounded-md p-3 border border-gray-300 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700">📈 Tendência Semanal</h5>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartMensal.slice(-8)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="inclusoes" stroke="#003c7d" strokeWidth={2} dot={{ fill: '#003c7d' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - CBO (Top 10) */}
      <div className="bg-white rounded-md p-3 border border-gray-300 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700">🥧 CBO (Top 10)</h5>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={chartCBO} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
              {chartCBO.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Carga Horária */}
      <div className="bg-white rounded-md p-3 border border-gray-300 h-[200px]">
        <h5 className="text-sm font-semibold mb-1.5 text-gray-700">🕐 Carga Horária</h5>
        <ResponsiveContainer width="100%" height="85%">
          <RadarChart data={chartCarga}>
            <PolarGrid />
            <PolarAngleAxis dataKey="carga" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            <Radar dataKey="valor" stroke="#003c7d" fill="#003c7d" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
