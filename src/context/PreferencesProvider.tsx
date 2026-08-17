import { useCallback, useState, type ReactNode } from "react"
import { PreferencesContext } from "./preferencesContext"
import type { Language } from "../lib/i18n"
import type { UnitSystem } from "../lib/units"

const LANGUAGE_STORAGE_KEY = "ha-dashboard-language"
const UNITS_STORAGE_KEY = "ha-dashboard-units"

function loadLanguage(): Language {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "fr" ? "fr" : "en"
}

function loadUnitSystem(): UnitSystem {
  const stored = localStorage.getItem(UNITS_STORAGE_KEY)
  return stored === "metric" || stored === "imperial" ? stored : "auto"
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => loadLanguage())
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => loadUnitSystem())

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }, [])

  const setUnitSystem = useCallback((system: UnitSystem) => {
    setUnitSystemState(system)
    localStorage.setItem(UNITS_STORAGE_KEY, system)
  }, [])

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, unitSystem, setUnitSystem }}>
      {children}
    </PreferencesContext.Provider>
  )
}
