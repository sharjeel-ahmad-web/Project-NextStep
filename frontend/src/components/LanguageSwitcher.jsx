import { Languages } from 'lucide-react'
import { useLearningLanguage } from './LanguageProvider'

const LanguageSwitcher = ({ compact = false, className = '' }) => {
  const { languageCode, languages, setLanguageCode } = useLearningLanguage()

  return (
    <label className={`language-switcher ${compact ? 'language-switcher-compact' : ''} ${className}`.trim()}>
      <span className="language-switcher__icon" aria-hidden="true">
        <Languages size={compact ? 16 : 18} />
      </span>
      <select
        value={languageCode}
        onChange={(event) => setLanguageCode(event.target.value)}
        aria-label="Select learning language"
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher
