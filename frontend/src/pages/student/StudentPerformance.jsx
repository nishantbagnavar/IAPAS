import { useEffect, useState } from 'react'
import { Brain, Lightbulb, AlertCircle, Sparkles, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const GRADE_META = {
  'A+': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', label: 'Excellent' },
  'A':  { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    badge: 'bg-blue-500',    label: 'Very Good' },
  'B+': { color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  badge: 'bg-indigo-500',  label: 'Good' },
  'B':  { color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200',  badge: 'bg-purple-500',  label: 'Average' },
  'C':  { color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-200',  badge: 'bg-yellow-500',  label: 'Below Average' },
  'F':  { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-500',     label: 'Failing' },
}

function GradeRing({ grade }) {
  const meta = GRADE_META[grade] || GRADE_META['F']
  const degrees = { 'A+': 340, A: 300, 'B+': 260, B: 216, C: 180, F: 120 }
  const deg = degrees[grade] || 120
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="38" fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="48" cy="48" r="38" fill="none"
          stroke={meta.badge.replace('bg-', '#').replace('-500', '')}
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 38}`}
          strokeDashoffset={`${2 * Math.PI * 38 * (1 - deg / 360)}`}
          className={meta.badge.includes('emerald') ? 'stroke-emerald-500' : meta.badge.includes('blue') ? 'stroke-blue-500' : meta.badge.includes('indigo') ? 'stroke-indigo-500' : meta.badge.includes('purple') ? 'stroke-purple-500' : meta.badge.includes('yellow') ? 'stroke-yellow-500' : 'stroke-red-500'}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${meta.color}`}>{grade}</span>
        <span className={`text-[10px] font-medium ${meta.color} opacity-70`}>{meta.label}</span>
      </div>
    </div>
  )
}

export default function StudentPerformance() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    if (!user?.profile_id) return
    try {
      const r = await api.get(`/api/performance/predict/${user.profile_id}`)
      setData(r.data)
    } catch {
      toast('Failed to load performance insights', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [user])

  const refresh = async () => {
    setRefreshing(true)
    await fetchData()
    toast('Predictions refreshed!', 'success')
  }

  if (loading) return <LoadingSpinner text="Running AI predictions…" />

  const overallMeta = GRADE_META[data?.overall_predicted_grade] || GRADE_META['F']

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered grade predictions and personalized recommendations</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall grade card */}
      <div className={`${overallMeta.bg} border ${overallMeta.border} rounded-2xl p-6`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <GradeRing grade={data?.overall_predicted_grade} />
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Brain className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Predicted Grade</p>
            </div>
            <p className={`text-3xl font-black ${overallMeta.color}`}>{data?.overall_predicted_grade} — {overallMeta.label}</p>
            <p className="text-sm text-gray-500 mt-1">{data?.student_name} · {data?.roll_number} · Semester {data?.semester}</p>
            <p className="text-xs text-gray-400 mt-2">
              Generated {new Date(data?.generated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* Per-subject cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data?.predictions?.map((p) => {
          const meta = GRADE_META[p.predicted_grade] || GRADE_META['F']
          return (
            <div key={p.subject_id} className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden`}>
              {/* Card header */}
              <div className={`${meta.bg} px-5 py-4 flex items-center justify-between border-b ${meta.border}`}>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{p.subject_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.subject_code}</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${meta.color}`}>{p.predicted_grade}</span>
                  <p className={`text-xs font-medium ${meta.color} opacity-70`}>{meta.label}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-5 py-3 flex gap-4 border-b border-gray-50 text-xs">
                <div>
                  <span className="text-gray-400">Attendance</span>
                  <p className={`font-bold ${p.attendance_pct >= 75 ? 'text-green-600' : 'text-red-500'}`}>{p.attendance_pct}%</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <span className="text-gray-400">Avg Marks</span>
                  <p className="font-bold text-gray-900">{p.avg_marks_pct}%</p>
                </div>
              </div>

              {/* Learning gap */}
              <div className="px-5 py-3 space-y-2.5">
                <div className="flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">Learning Gap</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.learning_gap}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">Suggestion</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI note */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Predictions are generated using a <strong>Random Forest</strong> ML model trained on your attendance percentage
          and weighted marks average. Grades and suggestions are refreshed on demand. Performance data is updated in real-time as new marks and attendance are recorded.
        </p>
      </div>
    </div>
  )
}
