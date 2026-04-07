import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, BookMarked, Award, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import { DashboardSkeleton } from '../../components/SkeletonLoader'

const GRADE_META = {
  'A+': { color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  A:    { color: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-200' },
  'B+': { color: 'text-indigo-600',  bg: 'bg-indigo-50',  ring: 'ring-indigo-200' },
  B:    { color: 'text-purple-600',  bg: 'bg-purple-50',  ring: 'ring-purple-200' },
  C:    { color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200' },
  F:    { color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200' },
}

const attColor = (p) => p >= 75 ? 'bg-emerald-500' : p >= 60 ? 'bg-amber-400' : 'bg-red-500'
const attText  = (p) => p >= 75 ? 'text-emerald-600' : p >= 60 ? 'text-amber-600' : 'text-red-600'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user?.profile_id) return
    Promise.all([
      api.get(`/api/attendance/student/${user.profile_id}`),
      api.get(`/api/marks/student/${user.profile_id}`),
      api.get(`/api/performance/predict/${user.profile_id}`),
    ])
      .then(([att, marks, perf]) => setData({ att: att.data, marks: marks.data, perf: perf.data }))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <DashboardSkeleton />
  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center fade-up">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <TrendingUp className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-gray-500 text-sm mb-3">Failed to load dashboard. Is the backend running?</p>
      <button onClick={() => window.location.reload()} className="text-indigo-600 text-sm font-semibold hover:underline">Retry</button>
    </div>
  )

  const attPct  = data?.att?.overall_attendance_pct ?? 0
  const marksPct = data?.marks?.overall_percentage ?? 0
  const grade   = data?.perf?.overall_predicted_grade ?? '—'
  const gradeMeta = GRADE_META[grade] || { color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200' }
  const subjects = data?.att?.subjects ?? []

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          Semester 3
        </span>
      </div>

      {/* ── Bento Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 auto-rows-auto">

        {/* Attendance — large tile (2×2) */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between fade-up-1 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CalendarCheck className={`w-5 h-5 ${attPct >= 75 ? 'text-emerald-600' : 'text-red-500'}`} />
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${attPct >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {attPct >= 75 ? 'Good Standing' : 'At Risk'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Attendance</p>
            <p className="text-4xl font-black text-gray-900 mt-1">{attPct}%</p>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div
                className={`${attColor(attPct)} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${attPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Required minimum: 75%</p>
          </div>
        </div>

        {/* Marks */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between fade-up-2 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <BookMarked className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Marks</p>
            <p className="text-4xl font-black text-gray-900 mt-1">{marksPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-2">Across all subjects</p>
          </div>
        </div>

        {/* Predicted Grade — accent tile */}
        <div className={`sm:col-span-2 ${gradeMeta.bg} rounded-2xl border-2 ${gradeMeta.ring} shadow-sm p-6 flex flex-col justify-between fade-up-3 hover:shadow-md transition-shadow relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className={`w-4 h-4 ${gradeMeta.color}`} />
            <p className={`text-xs font-semibold uppercase tracking-wider ${gradeMeta.color}`}>AI Predicted Grade</p>
          </div>
          <div>
            <p className={`text-6xl font-black ${gradeMeta.color}`}>{grade}</p>
            <p className={`text-xs mt-2 ${gradeMeta.color} opacity-70`}>Based on attendance &amp; marks trends</p>
          </div>
        </div>

        {/* Subject table — full width */}
        <div className="sm:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-up-4">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Subject Attendance Overview</h2>
            </div>
            <Link to="/student/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Subject', 'Classes', 'Present', 'Absent', 'Attendance %'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!subjects.length && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No attendance data yet.</td></tr>
                )}
                {subjects.map((s, idx) => (
                  <tr key={s.subject_id} className={`hover:bg-slate-50 transition-colors fade-up`} style={{ animationDelay: `${0.35 + idx * 0.05}s` }}>
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      <div>{s.subject_name}</div>
                      <div className="text-xs text-gray-400 font-normal">{s.subject_code}</div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{s.total_classes}</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-semibold">{s.present}</td>
                    <td className="px-6 py-3.5 text-red-500 font-semibold">{s.absent}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[72px]">
                          <div className={`h-1.5 rounded-full ${attColor(s.attendance_pct)} transition-all duration-500`} style={{ width: `${s.attendance_pct}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${attText(s.attendance_pct)} w-10 text-right`}>
                          {s.attendance_pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links — 3 cols */}
        {[
          { to: '/student/marks',       label: 'View Marks',   desc: 'See all exam results',      icon: BookMarked, color: 'bg-blue-600',   light: 'bg-blue-50',   text: 'text-blue-600' },
          { to: '/student/performance', label: 'AI Insights',  desc: 'Grade predictions & tips',   icon: Sparkles,   color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600' },
          { to: '/student/profile',     label: 'My Profile',   desc: 'Account &amp; settings',    icon: Award,      color: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600' },
        ].map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group fade-up-${i + 4}`}
          >
            <div className={`${item.color} p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto shrink-0 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
