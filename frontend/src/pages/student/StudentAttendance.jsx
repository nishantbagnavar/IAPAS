import { useEffect, useState } from 'react'
import { CalendarCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

function AttBadge({ pct }) {
  if (pct >= 75) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200"><CheckCircle className="w-3 h-3" />{pct}%</span>
  if (pct >= 60) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200"><AlertTriangle className="w-3 h-3" />{pct}%</span>
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><AlertTriangle className="w-3 h-3" />{pct}%</span>
}

export default function StudentAttendance() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.profile_id) return
    api.get(`/api/attendance/student/${user.profile_id}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSpinner text="Loading attendance…" />

  const overallPct = data?.overall_attendance_pct ?? 0
  const overallColor = overallPct >= 75 ? 'from-green-500 to-green-400' : overallPct >= 60 ? 'from-yellow-500 to-yellow-400' : 'from-red-500 to-red-400'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your attendance record across all subjects</p>
      </div>

      {/* Overall banner */}
      <div className={`bg-gradient-to-r ${overallColor} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Overall Attendance</p>
            <p className="text-5xl font-black mt-1">{overallPct}%</p>
            <p className="text-white/80 text-sm mt-2">
              {overallPct >= 75 ? 'You are in good standing. Keep it up!' :
               overallPct >= 60 ? 'Warning: Attendance below recommended threshold.' :
               'Critical: Attendance very low. Immediate action required.'}
            </p>
          </div>
          <CalendarCheck className="w-20 h-20 text-white/20" />
        </div>
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.min(overallPct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>0%</span><span>75% required</span><span>100%</span>
        </div>
      </div>

      {/* Subject cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!data?.subjects?.length && (
          <div className="col-span-full py-12 text-center text-gray-400 text-sm">No subject attendance records found.</div>
        )}
        {data?.subjects?.map((s) => {
          const pct = s.attendance_pct
          const color = pct >= 75 ? { ring: 'ring-green-200', bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' }
                      : pct >= 60 ? { ring: 'ring-yellow-200', bar: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' }
                      :             { ring: 'ring-red-200',    bar: 'bg-red-500',    text: 'text-red-600',   bg: 'bg-red-50' }
          return (
            <div key={s.subject_id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ring-1 ${color.ring}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{s.subject_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.subject_code}</p>
                </div>
                <AttBadge pct={pct} />
              </div>

              {/* Circular progress */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="32" cy="32" r="26" fill="none"
                      stroke={pct >= 75 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color.text}`}>{pct}%</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-gray-500">Present:</span>
                    <span className="font-semibold text-gray-900">{s.present}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-gray-500">Absent:</span>
                    <span className="font-semibold text-gray-900">{s.absent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-2 h-2 text-yellow-400" />
                    <span className="text-gray-500">Late:</span>
                    <span className="font-semibold text-gray-900">{s.late}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900">{s.total_classes}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Detailed Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Subject', 'Code', 'Total', 'Present', 'Absent', 'Late', 'Attendance %', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!data?.subjects?.length && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No records to display.</td></tr>
              )}
              {data?.subjects?.map((s) => (
                <tr key={s.subject_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{s.subject_name}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{s.subject_code}</td>
                  <td className="px-5 py-3.5 text-gray-600">{s.total_classes}</td>
                  <td className="px-5 py-3.5 text-green-600 font-medium">{s.present}</td>
                  <td className="px-5 py-3.5 text-red-500">{s.absent}</td>
                  <td className="px-5 py-3.5 text-yellow-600">{s.late}</td>
                  <td className="px-5 py-3.5"><AttBadge pct={s.attendance_pct} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium ${s.attendance_pct >= 75 ? 'text-green-600' : s.attendance_pct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {s.attendance_pct >= 75 ? 'Good' : s.attendance_pct >= 60 ? 'At Risk' : 'Critical'}
                    </span>
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
