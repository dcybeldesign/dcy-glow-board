import { useState } from "react"
import { HomeAssistantProvider } from "./context/HomeAssistantProvider"
import { useHomeAssistant } from "./hooks/useHomeAssistant"
import { useTranslation } from "./hooks/useTranslation"
import { ConnectionSetup } from "./components/ConnectionSetup"
import { Dashboard } from "./components/Dashboard"
import { EntityDebugList } from "./components/EntityDebugList"

function AppShell() {
  const { status, disconnect } = useHomeAssistant()
  const { t } = useTranslation()
  const [showDebug, setShowDebug] = useState(false)

  if (status !== "connected") {
    return <ConnectionSetup />
  }

  return (
    <div className="min-h-svh">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--seam)" }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--parchment)]">
          {t("app.title")}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDebug((v) => !v)}
            className="text-xs text-[var(--ash)] transition hover:text-[var(--parchment)]"
          >
            {showDebug ? t("app.viewDashboard") : t("app.viewAllEntities")}
          </button>
          <button
            onClick={disconnect}
            className="text-xs text-[var(--ash)] transition hover:text-[var(--parchment)]"
          >
            {t("app.disconnect")}
          </button>
        </div>
      </header>
      {showDebug ? <EntityDebugList /> : <Dashboard />}
    </div>
  )
}

function App() {
  return (
    <HomeAssistantProvider>
      <AppShell />
    </HomeAssistantProvider>
  )
}

export default App
