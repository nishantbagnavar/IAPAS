import { useEffect, useState } from 'react'
import { BarChart2, User } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from 'recharts'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const GRADE_COLOR = { 'A+': 'text-emerald-600', A: 'text-blue-600', 'B+': 'text-indigo-600', B: 'text-purple-600', C: 'text-yellow-600', F: 'text-red-600' }

export default function StudentAnalytics() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [marks, setMarks] = useState(null)
  const [att, setAtt] = useState(null)
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)

  useEffect(() => {
    api.get('/api/students')
      .then(r => setStudents(r.data))
      .finally(() => setInitLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    Promise.all([
      api.get(`/api/marks/student/${selectedId}`),
      api.get(`/api/attendance/student/${selectedId}`),
      api.get(`/api/performance/predict/${selectedId}`),
    ])
      .then(([m, a, p]) => { setMarks(m.data); setAtt(a.data); setPerf(p.data) })
      .finally(() => setLoading(false))
  }, [selectedId])

  if (initLoading) return <LoadingSpinner text="Loading students…" />

  // Build subject bar data
  const subjectData = att?.subjects?.map(s => {
    const predSubj = perf?.predictions?.find(p => p.subject_id === s.subject_id)
    return {
      name: s.subject_code,
      Attendance: s.attendance_pct,
      Marks: predSubj?.avg_marks_pct || 0,
    }
  }) || []

  // Radar data
  const radarData = att?.subjects?.map(s => ({
    subject: s.subject_code,
    A: s.attendance_pct,
  })) || []

  const selectedStudent = students.find(s => s.student_id === parseInt(selectedId))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">View detailed performance analytics for any student</p>
      </div>

      {/* Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Student</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="w-full sm:max-w-sm border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">Choose a student…</option>
          {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.roll_number})</option>)}
        </select>
      </div>

      {!selectedId && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <BarChart2 className="w-12 h-12 text-gray-200" />
          <p className="text-sm">Select a student to view their analytics</p>
        </div>
      )}

      {loading && <LoadingSpinner text="Loading analytics…" />}

      {!loading && selectedId && marks && att && perf && (
        <div className="space-y-6">
          {/* Student header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black">
                {selectedStudent?.name[0]}
              </div>
              <div>
                <p className="text-lg font-bold">{selectedStudent?.name}</p>
                <p className="text-indigo-200 text-sm">{selectedStudent?.roll_number} · Sem {selectedStudent?.semester} · Year {selectedStudent?.year}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white/70 text-xs">Overall Grade</p>
                <p className="text-3xl font-black">{perf.overall_predicted_grade}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 rounded-xl py-2">
                <p className="text-white/70 text-xs">Attendance</p>
                <p className="font-bold">{att.overall_attendance_pct}%</p>
              </div>
              <div className="bg-white/10 rounded-xl py-2">
                <p className="text-white/70 text-xs">Avg Marks</p>
                <p className="font-bold">{marks.overall_percentage.toFixed(1)}%</p>
              </div>
              <div className="bg-white/10 rounded-xl py-2">
                <p className="text-white/70 text-xs">Subjects</p>
                <p className="font-bold">{att.subjects.length}</p>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">Attendance vs Marks by Subject</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Attendance" fill="#06b6d4" radius={[3,3,0,0]} />
                  <Bar dataKey="Marks"      fill="#6366f1" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">Attendance Radar</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Radar name="Attendance %" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Tooltip formatter={v => [`${v}%`, 'Attendance']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-subject predictions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Subject-wise AI Predictions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Subject', 'Attendance', 'Avg Marks', 'Predicted Grade', 'Learning Gap', 'Suggestion'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {perf.predictions.map(p => (
                    <tr key={p.subject_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{p.subject_name}</p>
                        <p className="text-xs text-gray-400">{p.subject_code}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold ${p.attendance_pct >= 75 ? 'text-green-600' : 'text-red-500'}`}>{p.attendance_pct}%</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{p.avg_marks_pct}%</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-black ${GRADE_COLOR[p.predicted_grade] || 'text-gray-600'}`}>{p.predicted_grade}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]">{p.learning_gap}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]">{p.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
