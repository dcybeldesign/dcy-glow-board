import { createContext } from "react"
import type { HassEntities, HassServiceTarget } from "home-assistant-js-websocket"
import type { HAConnectionConfig, RestAuth } from "../lib/haClient"
import type {
  HAArea,
  HADeviceRegistryEntry,
  HAEntityRegistryEntry,
} from "../lib/haRegistry"

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"

export type WeatherForecastType = "daily" | "hourly" | "twice_daily"

// Shape of HA's `weather/subscribe_forecast` payload items — fields vary by
// weather integration, so everything but `datetime` is optional.
export type WeatherForecastDay = {
  datetime: string
  condition?: string
  temperature?: number
  templow?: number
  precipitation_probability?: number
}

export type HomeAssistantContextValue = {
  status: ConnectionStatus
  error: string | null
  entities: HassEntities
  restAuth: RestAuth | null
  areas: HAArea[]
  entityRegistry: HAEntityRegistryEntry[]
  deviceRegistry: HADeviceRegistryEntry[]
  registriesLoaded: boolean
  connect: (config: HAConnectionConfig) => Promise<void>
  disconnect: () => void
  callService: (
    domain: string,
    service: string,
    serviceData?: object,
    target?: HassServiceTarget,
  ) => Promise<unknown>
  subscribeForecast: (
    entityId: string,
    forecastType: WeatherForecastType,
    callback: (forecast: WeatherForecastDay[]) => void,
  ) => Promise<() => void>
}

export const HomeAssistantContext =
  createContext<HomeAssistantContextValue | null>(null)
