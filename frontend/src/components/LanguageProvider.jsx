import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'nextstep-learning-language'

export const learningLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English', queryLabel: 'English' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'Urdu', queryLabel: 'Urdu' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'Hindi', queryLabel: 'Hindi' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'Arabic', queryLabel: 'Arabic' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Turkish', queryLabel: 'Turkish' },
]

const defaultLanguage = learningLanguages[0]

export const LanguageProvider = ({ children }) => {
  const [languageCode, setLanguageCode] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultLanguage.code
    }

    return window.localStorage.getItem(STORAGE_KEY) || defaultLanguage.code
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, languageCode)

    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageCode
      document.documentElement.setAttribute('data-learning-language', languageCode)
    }
  }, [languageCode])

  const value = useMemo(() => {
    const language = learningLanguages.find((item) => item.code === languageCode) || defaultLanguage

    return {
      language,
      languageCode,
      languages: learningLanguages,
      setLanguageCode,
    }
  }, [languageCode])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLearningLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLearningLanguage must be used inside LanguageProvider')
  }

  return context
}
