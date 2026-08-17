import { useState, type FormEvent } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useTranslation } from "../hooks/useTranslation"
import type { TranslationKey } from "../lib/i18n"

export function ConnectionSetup() {
  const { status, error, connect } = useHomeAssistant()
  const { t } = useTranslation()
  const [url, setUrl] = useState("http://")
  const [token, setToken] = useState("")

  const isConnecting = status === "connecting"

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!url.trim() || !token.trim()) return
    try {
      await connect({ url: url.trim(), token: token.trim() })
    } catch {
      // error is already exposed via the context's `error` state
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-6 shadow-xl"
        style={{ borderColor: "var(--seam)", background: "var(--ember)" }}
      >
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--parchment)]">
          {t("connection.heading")}
        </h1>
        <p className="mb-5 text-sm text-[var(--ash)]">
          {t("connection.helpPre")}{" "}
          <code className="text-[var(--ash-dim)]">http://192.168.1.x:8123</code>
          {t("connection.helpPost")}
        </p>

        <label className="mb-1 block text-xs font-medium text-[var(--ash)]">
          {t("connection.addressLabel")}
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://192.168.1.x:8123"
          autoComplete="off"
          spellCheck={false}
          className="mb-4 w-full rounded-lg border px-3 py-2 text-sm text-[var(--parchment)] outline-none"
          style={{ borderColor: "var(--seam)", background: "var(--ink)" }}
        />

        <label className="mb-1 block text-xs font-medium text-[var(--ash)]">
          {t("connection.tokenLabel")}
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="•••••••••••••••••••••"
          autoComplete="off"
          spellCheck={false}
          className="mb-4 w-full rounded-lg border px-3 py-2 text-sm text-[var(--parchment)] outline-none"
          style={{ borderColor: "var(--seam)", background: "var(--ink)" }}
        />

        {error && (
          <p className="mb-4 text-sm" style={{ color: "var(--danger)" }}>
            {t(error as TranslationKey)}
          </p>
        )}

        <button
          type="submit"
          disabled={isConnecting}
          className="w-full rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60"
          style={{ background: "var(--flame)", color: "var(--ink)" }}
        >
          {isConnecting ? t("connection.connecting") : t("connection.connect")}
        </button>
      </form>
    </div>
  )
}
