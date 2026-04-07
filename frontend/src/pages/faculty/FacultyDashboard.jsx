import { useEffect, useState } from 'react'
import { Users, CalendarCheck, TrendingUp, Award } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { DashboardSkeleton } from '../../components/SkeletonLoader'

const GRADE_COLORS = {
  'A+': '#10b981', A: '#3b82f6', 'B+': '#6366f1',
  B: '#8b5cf6', C: '#f59e0b', F: '#ef4444',
}

function BentoStat({ title, value, icon: Icon, iconBg, iconColor, delay = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow fade-up${delay}`}>
      <div className={`${iconBg} p-3 rounded-xl shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-800">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/performance/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const pieData = data?.grade_distribution?.filter(g => g.count > 0) || []
  const barData = data?.subject_stats?.map(s => ({
    name: s.subject_name.split(' ').slice(0, 2).join(' '),
    'Avg Marks':      +s.avg_marks_pct,
    'Avg Attendance': +s.avg_attendance_pct,
    'Pass Rate':      +s.pass_rate,
  })) || []

  const passRate = data?.grade_distribution
    ? (data.grade_distribution.filter(g => g.grade !== 'F').reduce((a, b) => a + b.count, 0)
       / Math.max(data.total_students, 1)) * 100
    : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="fade-up">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome, {user?.name} &middot; Class overview and analytics</p>
      </div>

      {/* Stats bento row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStat title="Total Students"  value={data?.total_students}           icon={Users}        iconBg="bg-blue-50"   iconColor="text-blue-600"   delay="-1" />
        <BentoStat title="Avg Attendance"  value={`${data?.avg_attendance_pct}%`} icon={CalendarCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" delay="-2" />
        <BentoStat title="Avg Marks"       value={`${data?.avg_marks_pct}%`}      icon={TrendingUp}   iconBg="bg-indigo-50" iconColor="text-indigo-600"  delay="-3" />
        <BentoStat title="Pass Rate"       value={`${passRate.toFixed(0)}%`}      icon={Award}        iconBg="bg-purple-50" iconColor="text-purple-600"  delay="-4" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 fade-up-3">
        {/* Grade pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Grade Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={800}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, `Grade ${n}`]} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0]
                  return (
                    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-xs">
                      <span className="font-semibold" style={{ color: p.payload.fill }}>Grade {p.name}</span>
                      <p className="text-gray-600 mt-0.5">{p.value} students</p>
                    </div>
                  )
                }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No grade data yet.</p>}
        </div>

        {/* Subject bar — wider */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Subject-wise Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Avg Marks"      fill="#6366f1" radius={[4,4,0,0]} isAnimationActive animationDuration={900} />
              <Bar dataKey="Avg Attendance" fill="#06b6d4" radius={[4,4,0,0]} isAnimationActive animationDuration={1000} />
              <Bar dataKey="Pass Rate"      fill="#10b981" radius={[4,4,0,0]} isAnimationActive animationDuration={1100} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & needs attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 fade-up-4">
        {[
          { title: 'Top Performers',  students: data?.top_performers, accent: 'emerald' },
          { title: 'Needs Attention', students: data?.low_performers,  accent: 'red' },
        ].map(({ title, students, accent }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-${accent}-50 text-${accent}-600`}>
                {students?.length ?? 0} students
              </span>
            </div>
            <div className="p-4 space-y-2">
              {students?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No data available.</p>
              )}
              {students?.map((p) => (
                <div
                  key={p.student_id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors
                    ${accent === 'emerald'
                      ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                      : 'bg-red-50 border-red-100 hover:bg-red-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-700 border border-gray-200 shrink-0">
                      {p.student_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.student_name}</p>
                      <p className="text-xs text-gray-400">{p.roll_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${accent === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {p.predicted_grade}
                    </span>
                    <p className="text-xs text-gray-400">{p.overall_marks_pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
