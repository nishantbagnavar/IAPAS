import { useEffect, useState } from 'react'
import { FileBarChart, Download } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatsCard from '../../components/StatsCard'
import { Users, CalendarCheck, TrendingUp, Award } from 'lucide-react'

const ATT_COLOR = (p) => p >= 75 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-500' : 'bg-red-500'
const ATT_TEXT  = (p) => p >= 75 ? 'text-green-600' : p >= 60 ? 'text-yellow-600' : 'text-red-600'

export default function AdminReports() {
  const [attReport, setAttReport] = useState(null)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/attendance/report'),
      api.get('/api/performance/dashboard'),
    ])
      .then(([a, d]) => { setAttReport(a.data); setDash(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Generating reports…" />

  const passRate = dash?.grade_distribution
    ? Math.round(dash.grade_distribution.filter(g => g.grade !== 'F').reduce((a, b) => a + b.count, 0) / Math.max(dash.total_students, 1) * 100)
    : 0

  const subjectAttData = dash?.subject_stats?.map(s => ({
    name: s.subject_name.split(' ').slice(0, 2).join(' '),
    'Avg Attendance': s.avg_attendance_pct,
    'Avg Marks': s.avg_marks_pct,
    'Pass Rate': s.pass_rate,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">System-wide academic performance reports</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students"   value={attReport?.total_students}          icon={Users}        iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatsCard title="Avg Attendance"   value={`${dash?.avg_attendance_pct || 0}%`} icon={CalendarCheck} iconBg="bg-green-100"  iconColor="text-green-600" />
        <StatsCard title="Avg Marks"        value={`${dash?.avg_marks_pct || 0}%`}     icon={TrendingUp}   iconBg="bg-indigo-100" iconColor="text-indigo-600" />
        <StatsCard title="Pass Rate"        value={`${passRate}%`}                     icon={Award}        iconBg="bg-purple-100" iconColor="text-purple-600" />
      </div>

      {/* Subject chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileBarChart className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-900 text-sm">Subject-wise Performance Report</h2>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={subjectAttData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Avg Attendance" fill="#06b6d4" radius={[3,3,0,0]} />
            <Bar dataKey="Avg Marks"      fill="#6366f1" radius={[3,3,0,0]} />
            <Bar dataKey="Pass Rate"      fill="#10b981" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance report table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Student Attendance Report</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                {attReport?.report?.[0]?.subjects?.map(s => (
                  <th key={s.subject_id} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {s.subject_code}
                  </th>
                ))}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!attReport?.report?.length && (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-sm text-gray-400">No attendance data available.</td></tr>
              )}
              {attReport?.report?.map(r => {
                const perfData = dash?.top_performers?.concat(dash?.low_performers || []).find(p => p.student_name === r.student_name)
                return (
                  <tr key={r.student_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{r.student_name}</td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{r.roll_number}</td>
                    {r.subjects.map(s => (
                      <td key={s.subject_id} className="px-5 py-3.5">
                        <span className={`text-xs font-semibold ${ATT_TEXT(s.attendance_pct)}`}>{s.attendance_pct}%</span>
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${ATT_COLOR(r.overall_attendance_pct)}`} style={{ width: `${r.overall_attendance_pct}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${ATT_TEXT(r.overall_attendance_pct)}`}>{r.overall_attendance_pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-gray-700">{perfData?.predicted_grade || '—'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top/bottom performers from perf dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Top Performers', data: dash?.top_performers, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { title: 'Needs Attention', data: dash?.low_performers, color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-100' },
        ].map(({ title, data: perf, color, bg, border }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
            </div>
            <div className="p-4 space-y-2">
              {perf?.map(p => (
                <div key={p.student_id} className={`flex items-center justify-between ${bg} ${border} border rounded-xl px-4 py-3`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.student_name}</p>
                    <p className="text-xs text-gray-400">{p.roll_number} · Attendance: {p.overall_attendance_pct}%</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${color}`}>{p.predicted_grade}</span>
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
