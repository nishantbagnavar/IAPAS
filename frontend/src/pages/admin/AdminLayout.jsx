import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import { LayoutDashboard, Users, FileBarChart, BookOpen } from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/subjects',  icon: BookOpen,        label: 'Subjects' },
  { to: '/admin/reports',   icon: FileBarChart,    label: 'Reports' },
]

export default function AdminLayout() {
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
