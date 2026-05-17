import { Moon, SunMedium } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const ThemeToggle = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''}`}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? <SunMedium size={18} /> : <Moon size={18} />}
      </span>
      {!compact && <span>{isDark ? 'Day Mode' : 'Night Mode'}</span>}
    </button>
  )
}

export default ThemeToggle
