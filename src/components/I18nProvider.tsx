import { useState, useCallback } from 'react'
import { I18nContext } from '../hooks/useI18n'
import type { Language } from '../lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get saved language from storage, default to 'en'
    try {
      const saved = (wx as any).getStorageSync('music-practice-language')
      return saved === 'zh' || saved === 'en' ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      (wx as any).setStorageSync('music-practice-language', lang)
    } catch {
      // Ignore storage errors
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }, [language, setLanguage])

  // Import translations dynamically to avoid circular dependency
  const { translations } = require('../lib/i18n')

  const value = {
    language,
    t: translations[language],
    setLanguage,
    toggleLanguage
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
