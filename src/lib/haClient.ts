import {
  createConnection,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_HTTPS_TO_HTTP,
  type Connection,
} from "home-assistant-js-websocket"
import type { TranslationKey } from "./i18n"

export type HAConnectionConfig = {
  url: string
  token: string
}

const STORAGE_KEY = "ha-dashboard:connection"

export function loadStoredConnectionConfig(): HAConnectionConfig | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.url === "string" && typeof parsed?.token === "string") {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveConnectionConfig(config: HAConnectionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function clearConnectionConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "")
}

// The message/translationKey pair lets the connection layer stay
// translation-agnostic (no React/i18n dependency here) while still giving
// the UI a stable key to translate at render time; see ConnectionSetup.tsx.
export class HAConnectionError extends Error {
  code: number
  translationKey: TranslationKey

  constructor(code: number) {
    const key = connectionErrorKey(code)
    super(key)
    this.code = code
    this.translationKey = key
    this.name = "HAConnectionError"
  }
}

function connectionErrorKey(code: number): TranslationKey {
  switch (code) {
    case ERR_CANNOT_CONNECT:
      return "error.cannotConnect"
    case ERR_INVALID_AUTH:
      return "error.invalidAuth"
    case ERR_HASS_HOST_REQUIRED:
      return "error.hostRequired"
    case ERR_INVALID_HTTPS_TO_HTTP:
      return "error.mixedContent"
    default:
      return "error.unknown"
  }
}

export async function connectToHomeAssistant(
  config: HAConnectionConfig,
): Promise<Connection> {
  const auth = createLongLivedTokenAuth(normalizeUrl(config.url), config.token)
  try {
    return await createConnection({ auth })
  } catch (err) {
    if (typeof err === "number") {
      throw new HAConnectionError(err)
    }
    throw err
  }
}

export type RestAuth = {
  url: string
  token: string
}

export function getRestAuth(connection: Connection): RestAuth | null {
  const auth = connection.options.auth
  if (!auth) return null
  return { url: auth.data.hassUrl, token: auth.data.access_token }
}

export type { Connection }
