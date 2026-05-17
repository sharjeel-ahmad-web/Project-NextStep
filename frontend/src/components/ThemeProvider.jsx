import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'nextstep-theme'

const getSystemTheme = () => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    return window.localStorage.getItem(STORAGE_KEY) || getSystemTheme()
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY)

      if (!savedTheme) {
        setTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
      isDark: theme === 'dark',
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
