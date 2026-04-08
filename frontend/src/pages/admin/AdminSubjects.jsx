import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, UserPlus, UserMinus, X, ChevronDown } from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const EMPTY_FORM = { name: '', code: '', department: '', semester: 1, credits: 3 }

export default function AdminSubjects() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState([])
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [assignLoading, setAssignLoading] = useState(null)

  const fetchData = () => {
    return Promise.all([
      api.get('/api/admin/subjects-overview'),
      api.get('/api/admin/faculty-list'),
    ]).then(([s, f]) => {
      setSubjects(s.data)
      setFacultyList(f.data)
    })
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim() || !form.department.trim()) {
      toast('Please fill all required fields', 'warning')
      return
    }
    setSaving(true)
    try {
      await api.post('/api/subjects', {
        ...form,
        semester: Number(form.semester),
        credits: Number(form.credits),
      })
      toast('Subject added successfully', 'success')
      setForm(EMPTY_FORM)
      setShowAddForm(false)
      await fetchData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add subject', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (subjectId, subjectName) => {
    if (!confirm(`Delete "${subjectName}"? This will also remove all attendance, marks, and performance data for this subject.`)) return
    try {
      await api.delete(`/api/subjects/${subjectId}`)
      toast(`"${subjectName}" deleted`, 'success')
      if (expandedSubject === subjectId) setExpandedSubject(null)
      await fetchData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete subject', 'error')
    }
  }

  const handleAssign = async (subjectId, facultyId) => {
    setAssignLoading(`assign-${subjectId}-${facultyId}`)
    try {
      await api.post(`/api/admin/faculty/${facultyId}/subjects/${subjectId}`)
      toast('Faculty assigned', 'success')
      await fetchData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to assign faculty', 'error')
    } finally {
      setAssignLoading(null)
    }
  }

  const handleUnassign = async (subjectId, facultyId, facultyName) => {
    setAssignLoading(`unassign-${subjectId}-${facultyId}`)
    try {
      await api.delete(`/api/admin/faculty/${facultyId}/subjects/${subjectId}`)
      toast(`${facultyName} removed from subject`, 'success')
      await fetchData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to remove assignment', 'error')
    } finally {
      setAssignLoading(null)
    }
  }

  const getUnassignedFaculty = (subject) => {
    const assignedIds = new Set(subject.assigned_faculty.map(f => f.faculty_id))
    return facultyList.filter(f => !assignedIds.has(f.faculty_id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage subjects and faculty assignments</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Subject'}
        </button>
      </div>

      {/* Add Subject Form */}
      {showAddForm && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            New Subject
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject Name *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. Data Structures"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject Code *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. CS201"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              >
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Credits</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
              >
                {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c} Credits</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      <div className="space-y-3">
        {subjects.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No subjects yet. Add one above.</p>
          </div>
        )}

        {subjects.map(subj => {
          const isExpanded = expandedSubject === subj.subject_id
          const unassigned = getUnassignedFaculty(subj)

          return (
            <div key={subj.subject_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Subject row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{subj.subject_name}</span>
                    <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{subj.subject_code}</span>
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">Sem {subj.semester}</span>
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{subj.credits} cr</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{subj.department}</p>
                </div>

                {/* Assigned faculty badges */}
                <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs">
                  {subj.assigned_faculty.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No faculty assigned</span>
                  ) : (
                    subj.assigned_faculty.map(f => (
                      <span key={f.faculty_id} className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        {f.name}
                      </span>
                    ))
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : subj.subject_id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Manage Faculty</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(subj.subject_id, subj.subject_name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Faculty Panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned faculty */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Faculty</p>
                      {subj.assigned_faculty.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">None assigned yet</p>
                      ) : (
                        <div className="space-y-2">
                          {subj.assigned_faculty.map(f => (
                            <div key={f.faculty_id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{f.name}</p>
                                <p className="text-xs text-gray-400">{f.department}</p>
                              </div>
                              <button
                                onClick={() => handleUnassign(subj.subject_id, f.faculty_id, f.name)}
                                disabled={assignLoading === `unassign-${subj.subject_id}-${f.faculty_id}`}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                title="Remove assignment"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assign new faculty */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assign Faculty</p>
                      {unassigned.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">All faculty are already assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {unassigned.map(f => (
                            <div key={f.faculty_id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{f.name}</p>
                                <p className="text-xs text-gray-400">{f.department}</p>
                              </div>
                              <button
                                onClick={() => handleAssign(subj.subject_id, f.faculty_id)}
                                disabled={assignLoading === `assign-${subj.subject_id}-${f.faculty_id}`}
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 font-medium px-2.5 py-1 rounded-lg transition-all disabled:opacity-40"
                              >
                                <UserPlus className="w-3 h-3" />
                                Assign
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
