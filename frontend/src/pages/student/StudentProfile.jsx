import { useEffect, useState } from 'react'
import { User, Mail, Shield, Calendar, BookOpen, Building } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function StudentProfile() {
  const { user } = useAuth()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(r => setMe(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const fields = [
    { label: 'Full Name', value: me?.name, icon: User },
    { label: 'Email Address', value: me?.email, icon: Mail },
    { label: 'Role', value: me?.role?.charAt(0).toUpperCase() + me?.role?.slice(1), icon: Shield },
    { label: 'Account Created', value: new Date(me?.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' }), icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your account information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black">
            {me?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{me?.name}</p>
            <p className="text-indigo-200 text-sm">{me?.email}</p>
            <span className="mt-1.5 inline-block text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Academic info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Academic Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Department', value: 'Computer Science', icon: Building },
            { label: 'Semester', value: '3rd Semester', icon: BookOpen },
            { label: 'Academic Year', value: '2nd Year', icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
              <Icon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
