import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Brain,
  User,
} from 'lucide-react'

const NAV = [
  { to: '/student/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/attendance',  icon: ClipboardCheck,  label: 'Attendance' },
  { to: '/student/marks',       icon: BookOpen,        label: 'Marks' },
  { to: '/student/performance', icon: Brain,           label: 'Performance Insights' },
  { to: '/student/profile',     icon: User,            label: 'Profile' },
]

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Sidebar navItems={NAV} />
      <div className="lg:pl-64 pt-14 lg:pt-0 flex flex-col min-h-screen">
        <main className="p-6 max-w-6xl mx-auto w-full flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
