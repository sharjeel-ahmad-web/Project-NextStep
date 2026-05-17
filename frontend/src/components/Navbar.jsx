import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, User, Trophy, Map, BarChart3, Award, Home, Menu, X, FileText, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/roadmaps', label: 'Roadmaps', icon: Map },
      { to: '/progress', label: 'Progress', icon: BarChart3 },
      { to: '/resume-builder', label: 'Resume', icon: FileText },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      { to: '/certificates', label: 'Certificates', icon: Award },
    ],
    [],
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActiveLink = (path) => location.pathname === path

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="page-shell px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-charcoal)] text-white shadow-md shadow-[var(--brand-blue)]/20">
              <span className="font-bold text-sm tracking-tight">NS</span>
            </div>
            <p className="font-[var(--font-heading)] text-lg font-bold tracking-tight">NextStep AI</p>
          </Link>

          <div className="hidden items-center lg:flex gap-6">
            <div className="flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    isActiveLink(to)
                      ? 'bg-[var(--surface-strong)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-[var(--border-strong)]"></div>

            <div className="flex items-center gap-3">
              <ThemeToggle compact />
              
              <div className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-1 pr-3">
                <div className="rounded-full bg-[var(--brand-blue)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-blue)]">
                  {user?.xp || 0} XP
                </div>
                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--brand-blue)] transition-colors">
                  <User size={16} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <div className="h-4 w-px bg-[var(--border-strong)] mx-1"></div>
                <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors" title="Log out">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setIsMenuOpen((currentState) => !currentState)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 shadow-xl lg:hidden">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--surface-strong)] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{user?.name}</p>
                  <p className="text-xs font-semibold text-[var(--brand-blue)]">{user?.xp || 0} XP</p>
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActiveLink(to)
                      ? 'bg-[var(--surface-strong)] text-[var(--brand-blue)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}

              <div className="my-2 h-px bg-[var(--border-soft)]"></div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
