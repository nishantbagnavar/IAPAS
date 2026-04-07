import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = { student: 'Student', faculty: 'Faculty', admin: 'Administrator' }
const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  faculty: 'bg-purple-100 text-purple-700',
  admin:   'bg-orange-100 text-orange-700',
}

function NavItem({ item, onClick }) {
  const location = useLocation()
  const active = location.pathname === item.to
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span>{item.label}</span>
    </Link>
  )
}

function SidebarContent({ navItems, onNavClick }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">IAPAS</p>
            <p className="text-[10px] text-gray-400 leading-tight">Academic Automation</p>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user?.role]}`}>
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ navItems }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">IAPAS</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-gray-100 transition">
          {open ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent navItems={navItems} onNavClick={() => setOpen(false)} />
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-10">
        <SidebarContent navItems={navItems} onNavClick={undefined} />
      </div>
    </>
  )
}
