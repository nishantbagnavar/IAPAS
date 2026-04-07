import { useEffect, useState } from 'react'
import { Users, UserCheck, BookOpen, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import api from '../../api/client'
import { DashboardSkeleton } from '../../components/SkeletonLoader'

const GRADE_COLORS = {
  'A+': '#10b981', A: '#3b82f6', 'B+': '#6366f1',
  B: '#8b5cf6', C: '#f59e0b', F: '#ef4444',
}

const ROLE_BADGE = {
  admin:   'bg-orange-100 text-orange-700',
  faculty: 'bg-purple-100 text-purple-700',
  student: 'bg-blue-100 text-blue-700',
}

const AVATAR_BG = {
  admin:   'bg-orange-100 text-orange-700',
  faculty: 'bg-purple-100 text-purple-700',
  student: 'bg-indigo-100 text-indigo-700',
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

export default function AdminDashboard() {
  const [users,   setUsers]   = useState([])
  const [dash,    setDash]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/admin/users'), api.get('/api/performance/dashboard')])
      .then(([u, d]) => { setUsers(u.data); setDash(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const counts = {
    total:   users.length,
    student: users.filter(u => u.role === 'student').length,
    faculty: users.filter(u => u.role === 'faculty').length,
  }

  const pieData    = dash?.grade_distribution?.filter(g => g.count > 0) || []
  const subjectBar = dash?.subject_stats?.map(s => ({
    name: s.subject_name.split(' ').slice(0, 2).join(' '),
    'Avg Marks':      +s.avg_marks_pct,
    'Avg Attendance': +s.avg_attendance_pct,
  })) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="fade-up">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">System overview and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStat title="Total Users" value={counts.total}                         icon={Users}     iconBg="bg-indigo-50" iconColor="text-indigo-600" delay="-1" />
        <BentoStat title="Students"    value={counts.student}                       icon={UserCheck} iconBg="bg-blue-50"   iconColor="text-blue-600"   delay="-2" />
        <BentoStat title="Faculty"     value={counts.faculty}                       icon={BookOpen}  iconBg="bg-purple-50" iconColor="text-purple-600" delay="-3" />
        <BentoStat title="Avg Marks"   value={`${dash?.avg_marks_pct || 0}%`}       icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600" delay="-4" />
      </div>

      {/* Charts */}
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
                  {pieData.map(e => <Cell key={e.grade} fill={GRADE_COLORS[e.grade] || '#94a3b8'} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
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
          ) : <p className="text-sm text-gray-400 text-center py-16">No data yet.</p>}
        </div>

        {/* Subject bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Subject Performance Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectBar} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Avg Marks"      fill="#6366f1" radius={[4,4,0,0]} isAnimationActive animationDuration={900} />
              <Bar dataKey="Avg Attendance" fill="#06b6d4" radius={[4,4,0,0]} isAnimationActive animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-up-4 hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Recently Added Users</h2>
          <span className="text-xs text-gray-400">{users.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'Email', 'Role', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.slice(0, 8).map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors fade-up" style={{ animationDelay: `${0.3 + idx * 0.04}s` }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${AVATAR_BG[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
