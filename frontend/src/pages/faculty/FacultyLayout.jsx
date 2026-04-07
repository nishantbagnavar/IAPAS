import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import {
  LayoutDashboard,
  ClipboardCheck,
  PlusCircle,
  BarChart2,
} from 'lucide-react'

const NAV = [
  { to: '/faculty/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/attendance', icon: ClipboardCheck,  label: 'Mark Attendance' },
  { to: '/faculty/marks',      icon: PlusCircle,      label: 'Add Marks' },
  { to: '/faculty/analytics',  icon: BarChart2,       label: 'Student Analytics' },
]

export default function FacultyLayout() {
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
