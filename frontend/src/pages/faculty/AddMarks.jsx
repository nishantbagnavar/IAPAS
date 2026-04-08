import { useEffect, useState } from 'react'
import { PlusCircle, CheckCircle } from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const EXAM_TYPES = [
  { value: 'internal',   label: 'Internal Exam',  max: 30 },
  { value: 'external',   label: 'External Exam',  max: 100 },
  { value: 'assignment', label: 'Assignment',      max: 10 },
]

export default function AddMarks() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    student_id: '', subject_id: '', exam_type: 'internal',
    marks_obtained: '', max_marks: '30',
  })

  useEffect(() => {
    Promise.all([api.get('/api/faculty/me/subjects'), api.get('/api/students')])
      .then(([s, st]) => { setSubjects(s.data); setStudents(st.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleExamTypeChange = (et) => {
    const found = EXAM_TYPES.find(t => t.value === et)
    setForm(f => ({ ...f, exam_type: et, max_marks: found ? String(found.max) : f.max_marks }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const { student_id, subject_id, exam_type, marks_obtained, max_marks } = form
    if (!student_id || !subject_id || marks_obtained === '') { toast('Please fill all fields', 'warning'); return }
    if (parseFloat(marks_obtained) > parseFloat(max_marks)) { toast('Marks obtained cannot exceed max marks', 'error'); return }
    setSaving(true)
    try {
      await api.post('/api/marks/add', {
        student_id: parseInt(student_id),
        subject_id: parseInt(subject_id),
        exam_type,
        marks_obtained: parseFloat(marks_obtained),
        max_marks: parseFloat(max_marks),
      })
      toast('Marks saved successfully!', 'success')
      setForm(f => ({ ...f, student_id: '', marks_obtained: '' }))
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save marks', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading data…" />

  const pct = form.marks_obtained && form.max_marks
    ? Math.round((parseFloat(form.marks_obtained) / parseFloat(form.max_marks)) * 100) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Marks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enter exam marks for a student</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Student */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Student</label>
            <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Select student…</option>
              {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.roll_number})</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
            <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">
                {subjects.length === 0 ? 'No subjects assigned — contact admin' : 'Select subject…'}
              </option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          {/* Exam type buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Exam Type</label>
            <div className="flex gap-2">
              {EXAM_TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => handleExamTypeChange(t.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.exam_type === t.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Marks row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Marks Obtained</label>
              <input type="number" min="0" max={form.max_marks} step="0.5"
                value={form.marks_obtained}
                onChange={e => setForm(f => ({ ...f, marks_obtained: e.target.value }))}
                placeholder="e.g. 25"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Max Marks</label>
              <input type="number" min="1"
                value={form.max_marks}
                onChange={e => setForm(f => ({ ...f, max_marks: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Live percentage preview */}
          {pct !== null && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700">
                Score: <strong>{form.marks_obtained}/{form.max_marks}</strong> = <strong>{pct}%</strong>
                {' '}({pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F'})
              </span>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            ) : (
              <><PlusCircle className="w-4 h-4" />Save Marks</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
