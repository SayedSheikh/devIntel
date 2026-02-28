// components/analytics/AnalyticsClient.js
"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Target, TrendingUp, UserCheck } from "lucide-react";

// ── StatCard — top-level ──
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for dark theme charts
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-white text-sm font-semibold">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// Colors for pie/donut chart segments
const STATUS_COLORS = {
  shortlisted: "#64748b",
  contacted: "#3b82f6",
  interviewing: "#eab308",
  offered: "#a855f7",
  hired: "#22c55e",
  rejected: "#ef4444",
};

// ── Main export ──
export default function AnalyticsClient({ data }) {
  const {
    totalDevelopers,
    totalCampaigns,
    statusCounts,
    topSkills,
    activitySeries,
  } = data;

  const totalTracked = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const totalHired = statusCounts["hired"] || 0;
  const conversionRate =
    totalTracked > 0 ? Math.round((totalHired / totalTracked) * 100) : 0;

  // Format for Recharts — each chart needs a specific array structure
  const skillChartData = topSkills.map(({ skill, count }) => ({
    name: skill,
    count,
  }));

  const activityChartData = activitySeries.map(({ day, count }) => ({
    day,
    count,
  }));

  const pipelineChartData = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || "#64748b",
    }),
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Platform-wide recruitment insights
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Developers"
          value={totalDevelopers}
          icon={Users}
          color="bg-indigo-600"
        />
        <StatCard
          title="Active Campaigns"
          value={totalCampaigns}
          icon={Target}
          color="bg-emerald-600"
        />
        <StatCard
          title="Candidates"
          value={totalTracked}
          icon={TrendingUp}
          color="bg-violet-600"
        />
        <StatCard
          title="Hired"
          value={`${totalHired} (${conversionRate}%)`}
          icon={UserCheck}
          color="bg-amber-600"
        />
      </div>

      {/* Top row charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills — Horizontal Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-1">Top Skills in Pool</h3>
          <p className="text-slate-500 text-xs mb-4">
            Most common developer skills
          </p>
          {skillChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={skillChartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: "#1e293b" }}
                />
                <Bar
                  dataKey="count"
                  name="Developers"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              No skill data yet
            </div>
          )}
        </div>

        {/* Pipeline Status — Donut/Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-1">
            Pipeline Distribution
          </h3>
          <p className="text-slate-500 text-xs mb-4">
            {conversionRate}% overall conversion rate
          </p>
          {pipelineChartData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie
                    data={pipelineChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value">
                    {pipelineChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {pipelineChartData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <p className="text-slate-400 text-xs capitalize">
                        {entry.name}
                      </p>
                    </div>
                    <p className="text-white text-xs font-semibold">
                      {entry.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
              No pipeline data yet
            </div>
          )}
        </div>
      </div>

      {/* Activity Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-1">
          Activity Trend — Last 7 Days
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          Developer activity events recorded daily
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={activityChartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<DarkTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              name="Events"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#818cf8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
