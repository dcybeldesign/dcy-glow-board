import { useContext } from "react"
import { PreferencesContext } from "../context/preferencesContext"
import { convertByUnit, type ConvertedValue } from "../lib/units"

export function useUnits() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error("useUnits must be used within <PreferencesProvider>")
  }
  function convert(value: number, unit: string | undefined): ConvertedValue {
    return convertByUnit(value, unit, ctx!.unitSystem)
  }
  return { convert, unitSystem: ctx.unitSystem, setUnitSystem: ctx.setUnitSystem }
}
