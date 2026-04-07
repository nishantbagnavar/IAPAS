import { useEffect, useState } from 'react'
import { BookOpen, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const EXAM_COLORS = { internal: '#6366f1', external: '#06b6d4', assignment: '#f59e0b' }
const EXAM_LABELS = { internal: 'Internal', external: 'External', assignment: 'Assignment' }

const GradeBadge = ({ pct }) => {
  const g = pct >= 90 ? ['A+', 'text-emerald-700 bg-emerald-50 border-emerald-200']
          : pct >= 80 ? ['A',  'text-blue-700 bg-blue-50 border-blue-200']
          : pct >= 70 ? ['B+', 'text-indigo-700 bg-indigo-50 border-indigo-200']
          : pct >= 60 ? ['B',  'text-purple-700 bg-purple-50 border-purple-200']
          : pct >= 50 ? ['C',  'text-yellow-700 bg-yellow-50 border-yellow-200']
          :             ['F',  'text-red-700 bg-red-50 border-red-200']
  return <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${g[1]}`}>{g[0]}</span>
}

export default function StudentMarks() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.profile_id) return
    api.get(`/api/marks/student/${user.profile_id}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSpinner text="Loading marks…" />

  // Build chart data: group by subject, average % per exam type
  const subjectMap = {}
  data?.marks?.forEach((m) => {
    if (!subjectMap[m.subject_name]) subjectMap[m.subject_name] = { name: m.subject_code, internal: [], external: [], assignment: [] }
    subjectMap[m.subject_name][m.exam_type].push(m.percentage)
  })

  const chartData = Object.entries(subjectMap).map(([, v]) => ({
    name: v.name,
    Internal:   v.internal.length   ? +(v.internal.reduce((a, b) => a + b) / v.internal.length).toFixed(1) : null,
    External:   v.external.length   ? +(v.external.reduce((a, b) => a + b) / v.external.length).toFixed(1) : null,
    Assignment: v.assignment.length ? +(v.assignment.reduce((a, b) => a + b) / v.assignment.length).toFixed(1) : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your academic performance across all subjects and exam types</p>
      </div>

      {/* Overall */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Overall Percentage</p>
            <p className="text-5xl font-black mt-1">{data?.overall_percentage?.toFixed(1)}%</p>
            <p className="text-white/70 text-sm mt-1">{data?.student_name} · {data?.roll_number}</p>
          </div>
          <GradeBadge pct={data?.overall_percentage} />
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-900 text-sm">Performance by Subject & Exam Type</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
            <Tooltip
              formatter={(v, n) => [`${v}%`, n]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Internal"   fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="External"   fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Assignment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Marks table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-900 text-sm">All Marks Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Subject', 'Code', 'Exam Type', 'Obtained', 'Max', '%', 'Grade'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!data?.marks?.length && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No marks records found.</td></tr>
              )}
              {data?.marks?.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{m.subject_name}</td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{m.subject_code}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${EXAM_COLORS[m.exam_type]}18`, color: EXAM_COLORS[m.exam_type] }}>
                      {EXAM_LABELS[m.exam_type]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{m.marks_obtained}</td>
                  <td className="px-5 py-3.5 text-gray-500">{m.max_marks}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${m.percentage}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{m.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><GradeBadge pct={m.percentage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
