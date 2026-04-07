import { Link } from 'react-router-dom'
import { Brain, BarChart2, CalendarCheck, BookOpen, Users, Shield, ArrowRight, GraduationCap } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    desc: 'RandomForest ML model predicts student grades and identifies learning gaps before exams.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance Tracking',
    desc: 'Faculty can mark and manage attendance in seconds. Students see live attendance percentages.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: BarChart2,
    title: 'Marks & Analytics',
    desc: 'Detailed exam performance charts across internal, external, and assignment categories.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Separate dashboards for Students, Faculty, and Admins — each with tailored tools.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: BookOpen,
    title: 'Performance Insights',
    desc: 'Personalised learning gap analysis and study suggestions for every subject.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT-based authentication, role enforcement, and encrypted passwords on every request.',
    color: 'bg-red-100 text-red-600',
  },
]

const STATS = [
  { value: '10+', label: 'Students Enrolled' },
  { value: '5', label: 'Subjects Tracked' },
  { value: '1,500+', label: 'Attendance Records' },
  { value: '250+', label: 'Marks Entries' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">IAPAS</span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <Brain className="w-3.5 h-3.5" />
              AI-Powered Academic Automation
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
              Intelligent Academic<br />Process Automation System
            </h1>
            <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              IAPAS helps educators and students track attendance, monitor marks, and get
              AI-powered grade predictions — all in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition shadow-lg"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 px-6 border-b border-gray-100">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-indigo-600 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">Everything your institution needs</h2>
              <p className="text-gray-500 text-base max-w-xl mx-auto">
                A complete academic management suite built with FastAPI, React, and scikit-learn.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-indigo-100 transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Three roles, one platform</h2>
            <p className="text-gray-500 mb-12">Each role gets a tailored dashboard experience.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { role: 'Student', color: 'bg-blue-600', desc: 'View attendance, marks, AI predictions, and your profile.', icon: GraduationCap },
                { role: 'Faculty', color: 'bg-purple-600', desc: 'Mark attendance, enter grades, and analyse student analytics.', icon: BookOpen },
                { role: 'Admin', color: 'bg-orange-500', desc: 'Manage users, view system-wide reports and performance dashboards.', icon: Shield },
              ].map((r) => (
                <div key={r.role} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                    <r.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{r.role}</h3>
                  <p className="text-sm text-gray-500">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Ready to get started?</h2>
            <p className="text-gray-500 mb-8">Login with your institutional credentials to access your dashboard.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-lg"
            >
              Login to IAPAS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded flex items-center justify-center">
            <GraduationCap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-gray-600">IAPAS</span>
        </div>
        <p>Intelligent Academic Process Automation System &mdash; Built with FastAPI, React &amp; scikit-learn</p>
      </footer>
    </div>
  )
}
