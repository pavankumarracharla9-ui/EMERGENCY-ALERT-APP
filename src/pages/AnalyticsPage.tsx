import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  Download,
  Printer,
  Calendar,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface AnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const { incidents, ambulances, hospitals, hospitalNotifications } = useApp();

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Dynamic calculations from actual stored data
  // 1. Incidents by Type
  const typeMap: Record<string, number> = {};
  incidents.forEach((inc) => {
    typeMap[inc.type] = (typeMap[inc.type] || 0) + 1;
  });
  const typeChartData = Object.keys(typeMap).map((key) => ({
    name: key,
    count: typeMap[key],
  }));

  // 2. Incidents by Priority
  const priorityMap: Record<string, number> = {
    Critical: 0,
    High: 0,
    Moderate: 0,
    Low: 0,
  };
  incidents.forEach((inc) => {
    if (priorityMap[inc.priority] !== undefined) {
      priorityMap[inc.priority]++;
    }
  });
  const priorityChartData = [
    { name: 'Critical', value: priorityMap.Critical, color: '#E53945' },
    { name: 'High', value: priorityMap.High, color: '#D97706' },
    { name: 'Moderate', value: priorityMap.Moderate, color: '#0284C7' },
    { name: 'Low', value: priorityMap.Low, color: '#64748B' },
  ].filter((p) => p.value > 0);

  // 3. Response Time Trends (Simulated timeline data points based on incident history)
  const responseTrendData = [
    { hour: '06:00', avgMins: 6.2, incidents: 1 },
    { hour: '08:00', avgMins: 7.4, incidents: 3 },
    { hour: '10:00', avgMins: 5.1, incidents: 4 },
    { hour: '12:00', avgMins: 4.8, incidents: 6 },
    { hour: '14:00', avgMins: 5.3, incidents: 2 },
    { hour: '16:00', avgMins: 6.8, incidents: 5 },
    { hour: '18:00', avgMins: 5.4, incidents: incidents.length },
  ];

  // 4. Status distribution
  const statusMap: Record<string, number> = {};
  incidents.forEach((inc) => {
    statusMap[inc.status] = (statusMap[inc.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusMap).map((k) => ({
    status: k,
    count: statusMap[k],
  }));

  // 5. Unit utilization
  const unitUtilizationData = ambulances.map((amb) => ({
    name: amb.callSign,
    status: amb.status,
    fuel: amb.fuelLevel,
  }));

  // CSV Export Function
  const exportToCsv = () => {
    const headers = ['Incident ID', 'Type', 'Priority', 'Status', 'Affected Count', 'Address', 'Reported At', 'Assigned Unit'];
    const rows = incidents.map((i) => [
      i.id,
      i.type,
      i.priority,
      i.status,
      i.affectedCount,
      `"${i.location.address.replace(/"/g, '""')}"`,
      i.reportedAt,
      i.assignedUnitId || 'Unassigned',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RESQ_AI_Incidents_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Emergency Analytics &amp; Response Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time data visualization computed dynamically from current database incident records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCsv}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-[#18B6A4]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#18B6A4] hover:bg-[#159a8b] text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Stored Records</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {incidents.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Live memory store</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Simulated Avg Response</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            5.2 min
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>Target $\le$ 8.0 min met</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Pre-Hospital Hospital Alerts</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {hospitalNotifications.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Transmitted to trauma centers</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Casualties Triaged</span>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {incidents.reduce((sum, i) => sum + i.affectedCount, 0)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Extricated &amp; treated</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Incidents by Category */}
        <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Incidents by Emergency Category
          </h3>
          <div className="h-64">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1220',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#18B6A4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No incident data to display
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Priority Distribution */}
        <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Severity &amp; Triage Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1220',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No priority data</div>
            )}
          </div>
        </div>

        {/* Chart 3: Simulated Response Time Trends */}
        <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Simulated Response Time Curve (Minutes)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18B6A4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#18B6A4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1220',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgMins"
                  stroke="#18B6A4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#timeColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Status Distribution */}
        <div className="p-5 rounded-2xl bg-[#111C30] border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Current Case Lifecycle Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={statusChartData}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="status" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1220',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Printable Report Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  RESQ-AI Operational Shift Report
                </h3>
                <p className="text-xs text-slate-500">
                  Generated: {new Date().toLocaleString()} · Demonstration Registry
                </p>
              </div>
              <button
                onClick={() => setPrintModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 block">Total Cases Logged</span>
                  <span className="font-bold text-base text-slate-900 font-mono">{incidents.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Critical</span>
                  <span className="font-bold text-base text-rose-600 font-mono">{priorityMap.Critical}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hospital Pre-Alerts</span>
                  <span className="font-bold text-base text-indigo-600 font-mono">
                    {hospitalNotifications.length}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Incident Registry Summary</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 border-b">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Priority</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {incidents.map((i) => (
                        <tr key={i.id}>
                          <td className="p-2 font-mono font-bold">{i.id}</td>
                          <td className="p-2">{i.type}</td>
                          <td className="p-2 font-semibold">{i.priority}</td>
                          <td className="p-2">{i.status}</td>
                          <td className="p-2">{i.assignedUnitId || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                Notice: All figures represent demonstration data simulated within the RESQ-AI university hackathon showcase.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Print to PDF / Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
