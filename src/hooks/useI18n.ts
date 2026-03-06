import { createContext, useContext } from 'react'
import type { Language, Translations } from '../lib/i18n'
import { translations } from '../lib/i18n'

interface I18nContextValue {
  language: Language
  t: Translations
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
