import { useContext } from "react"
import { PreferencesContext } from "../context/preferencesContext"
import { translate, type TranslationKey } from "../lib/i18n"

export function useTranslation() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within <PreferencesProvider>")
  }
  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    return translate(ctx!.language, key, params)
  }
  return { t, language: ctx.language, setLanguage: ctx.setLanguage }
}
