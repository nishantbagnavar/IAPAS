import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'

import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentMarks from './pages/student/StudentMarks'
import StudentPerformance from './pages/student/StudentPerformance'
import StudentProfile from './pages/student/StudentProfile'

import FacultyLayout from './pages/faculty/FacultyLayout'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import MarkAttendance from './pages/faculty/MarkAttendance'
import AddMarks from './pages/faculty/AddMarks'
import StudentAnalytics from './pages/faculty/StudentAnalytics'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSubjects from './pages/admin/AdminSubjects'
import AdminReports from './pages/admin/AdminReports'

const ROLE_HOME = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  admin:   '/admin/dashboard',
}

function RootRedirect() {
  const { user } = useAuth()
  return user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Landing />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<StudentDashboard />} />
        <Route path="attendance"  element={<StudentAttendance />} />
        <Route path="marks"       element={<StudentMarks />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="profile"     element={<StudentProfile />} />
      </Route>

      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<FacultyDashboard />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="marks"      element={<AddMarks />} />
        <Route path="analytics"  element={<StudentAnalytics />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"     element={<AdminUsers />} />
        <Route path="subjects"  element={<AdminSubjects />} />
        <Route path="reports"   element={<AdminReports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
