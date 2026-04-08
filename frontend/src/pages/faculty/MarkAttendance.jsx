import { useEffect, useState } from 'react'
import { ClipboardCheck, CheckCircle, Save } from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const STATUS_OPTS = [
  { value: 'present', label: 'P', color: 'bg-green-500 text-white border-green-500', ring: 'ring-green-300' },
  { value: 'absent',  label: 'A', color: 'bg-red-500 text-white border-red-500',   ring: 'ring-red-300' },
  { value: 'late',    label: 'L', color: 'bg-yellow-400 text-white border-yellow-400', ring: 'ring-yellow-300' },
]

export default function MarkAttendance() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [selectedSubject, setSelectedSubject] = useState('')
  const [date, setDate] = useState(today)
  const [attendance, setAttendance] = useState({}) // { student_id: status }

  // Load subjects and students once
  useEffect(() => {
    Promise.all([api.get('/api/faculty/me/subjects'), api.get('/api/students')])
      .then(([s, st]) => {
        setSubjects(s.data)
        setStudents(st.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Whenever subject or date changes, fetch existing saved attendance and pre-fill
  useEffect(() => {
    if (!selectedSubject || students.length === 0) {
      // Reset to default (present) when no subject selected
      const defaults = {}
      students.forEach(s => { defaults[s.student_id] = 'present' })
      setAttendance(defaults)
      return
    }

    setLoadingExisting(true)
    api.get(`/api/attendance/subject/${selectedSubject}`)
      .then(({ data }) => {
        // Filter records for the selected date
        const recordsForDate = data.filter(r => r.date === date)
        const savedMap = {}
        recordsForDate.forEach(r => { savedMap[r.student_id] = r.status })

        // Pre-fill: use saved status if exists, else default to 'present'
        const merged = {}
        students.forEach(s => {
          merged[s.student_id] = savedMap[s.student_id] || 'present'
        })
        setAttendance(merged)
      })
      .catch(() => {
        // On error, just default everyone to present
        const defaults = {}
        students.forEach(s => { defaults[s.student_id] = 'present' })
        setAttendance(defaults)
      })
      .finally(() => setLoadingExisting(false))
  }, [selectedSubject, date, students])

  const markAll = (status) => {
    const upd = {}
    students.forEach(s => { upd[s.student_id] = status })
    setAttendance(upd)
  }

  const submit = async () => {
    if (!selectedSubject) { toast('Please select a subject', 'warning'); return }
    setSaving(true)
    try {
      await Promise.all(
        students.map(s =>
          api.post('/api/attendance/mark', {
            student_id: s.student_id,
            subject_id: parseInt(selectedSubject),
            date,
            status: attendance[s.student_id] || 'present',
          })
        )
      )
      toast(`Attendance saved for ${students.length} students!`, 'success')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save attendance', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading data…" />

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount  = Object.values(attendance).filter(s => s === 'absent').length
  const lateCount    = Object.values(attendance).filter(s => s === 'late').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select subject and date, then mark each student</p>
      </div>

      {/* Config row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">
                {subjects.length === 0 ? 'No subjects assigned — contact admin' : 'Select a subject…'}
              </option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Summary + quick mark */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-3 text-sm">
            <span className="font-semibold text-green-600">{presentCount} Present</span>
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-red-500">{absentCount} Absent</span>
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-yellow-500">{lateCount} Late</span>
          </div>
          <div className="flex gap-2 ml-auto">
            {[
              { label: 'All Present', status: 'present', style: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' },
              { label: 'All Absent',  status: 'absent',  style: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' },
            ].map(b => (
              <button key={b.status} onClick={() => markAll(b.status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${b.style}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-900 text-sm">{students.length} Students</h2>
          {loadingExisting && (
            <span className="ml-auto text-xs text-indigo-500 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              Loading saved attendance…
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {students.map((s) => (
            <div key={s.student_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {s.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.roll_number}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {STATUS_OPTS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAttendance(prev => ({ ...prev, [s.student_id]: opt.value }))}
                    className={`w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all ${
                      attendance[s.student_id] === opt.value
                        ? `${opt.color} ring-2 ${opt.ring} scale-110 shadow-sm`
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={saving || !selectedSubject}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
      >
        {saving ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
        ) : (
          <><Save className="w-4 h-4" />Save Attendance for {students.length} Students</>
        )}
      </button>
    </div>
  )
}
