import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Search, X } from 'lucide-react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const ROLE_TABS = ['all', 'student', 'faculty', 'admin']
const ROLE_STYLE = {
  admin:   'bg-orange-100 text-orange-700',
  faculty: 'bg-purple-100 text-purple-700',
  student: 'bg-blue-100 text-blue-700',
}

function AddUserModal({ onClose, onSuccess }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    roll_number: '', department: 'Computer Science', semester: 1, year: 1,
    subject_specialization: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast('Name, email and password required', 'warning'); return }
    if (form.role === 'student' && !form.roll_number) { toast('Roll number required for students', 'warning'); return }
    setSaving(true)
    try {
      await api.post('/api/admin/create-user', {
        ...form,
        semester: parseInt(form.semester),
        year: parseInt(form.year),
      })
      toast('User created!', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
            <div className="flex gap-2">
              {['student', 'faculty', 'admin'].map(r => (
                <button type="button" key={r} onClick={() => set('role', r)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 capitalize transition ${
                    form.role === r ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Common fields */}
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. John Doe' },
            { label: 'Email',     key: 'email', type: 'email', placeholder: 'john@iapas.edu' },
            { label: 'Password',  key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}

          {/* Student fields */}
          {form.role === 'student' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Student Profile</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Roll Number *</label>
                  <input value={form.roll_number} onChange={e => set('roll_number', e.target.value)}
                    placeholder="CS2400" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
                  <input value={form.department} onChange={e => set('department', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Semester</label>
                  <input type="number" min="1" max="8" value={form.semester} onChange={e => set('semester', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Year</label>
                  <input type="number" min="1" max="4" value={form.year} onChange={e => set('year', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          )}

          {/* Faculty fields */}
          {form.role === 'faculty' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Faculty Profile</p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
                <input value={form.department} onChange={e => set('department', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject Specialization</label>
                <input value={form.subject_specialization} onChange={e => set('subject_specialization', e.target.value)}
                  placeholder="Data Structures, Algorithms"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchUsers = () => {
    api.get('/api/admin/users')
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setDeletingId(userId)
    try {
      await api.delete(`/api/admin/user/${userId}`)
      toast(`${name} deleted`, 'success')
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner text="Loading users…" />

  const filtered = users.filter(u =>
    (tab === 'all' || u.role === tab) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} total accounts</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {ROLE_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t} {t !== 'all' && `(${users.filter(u => u.role === t).length})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['User', 'Email', 'Role', 'Details', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">{u.name[0]}</div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {u.roll_number && <span>Roll: {u.roll_number}</span>}
                    {u.department && !u.roll_number && <span>{u.department}</span>}
                    {!u.roll_number && !u.department && '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id || u.role === 'admin'}
                      title={u.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {deletingId === u.id
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin inline-block" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} onSuccess={fetchUsers} />}
    </div>
  )
}
