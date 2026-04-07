import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  const dashLink = user
    ? user.role === 'admin' ? '/admin/dashboard'
    : user.role === 'faculty' ? '/faculty/dashboard'
    : '/student/dashboard'
    : '/'

  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4">
                  <path d="M16 4 L6 28 L10.5 28 L13 22 L19 22 L21.5 28 L26 28 Z M16 10 L18 17 L14 17 Z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-sm">IAPAS</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Intelligent Academic Process Automation System — built with FastAPI, React &amp; scikit-learn.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</p>
            <ul className="space-y-2">
              {[
                { to: dashLink, label: 'Dashboard' },
                { to: '/login',  label: 'Login' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
                   className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System</p>
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-xs text-gray-500 font-medium">System Status: Online</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              &copy; {new Date().getFullYear()} IAPAS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
