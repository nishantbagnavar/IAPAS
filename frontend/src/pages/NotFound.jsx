import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Home, Cloud } from 'lucide-react'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const homeLink = user
    ? user.role === 'admin' ? '/admin/dashboard'
    : user.role === 'faculty' ? '/faculty/dashboard'
    : '/student/dashboard'
    : '/'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative text-center max-w-lg fade-up">
        {/* Cloud icon cluster */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Cloud className="w-24 h-24 text-indigo-100 fill-indigo-50" strokeWidth={1} />
            <Cloud className="w-16 h-16 text-purple-100 fill-purple-50 absolute -right-8 top-4" strokeWidth={1} />
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-indigo-600 select-none">
              404
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Lost in the Clouds?
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you're looking for drifted away. It may have been moved,
          deleted, or never existed. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to={homeLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            <Home className="w-4 h-4" />
            {user ? 'Back to Dashboard' : 'Go to Home'}
          </Link>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-xs text-gray-300">
          IAPAS &mdash; Intelligent Academic Process Automation
        </p>
      </div>
    </div>
  )
}
