import { createContext } from "react"
import type { Language } from "../lib/i18n"
import type { UnitSystem } from "../lib/units"

export type PreferencesContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)
