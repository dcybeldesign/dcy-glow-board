import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  subscribeEntities,
  callService as haCallService,
  type Connection,
  type HassEntities,
} from "home-assistant-js-websocket"
import {
  clearConnectionConfig,
  connectToHomeAssistant,
  getRestAuth,
  loadStoredConnectionConfig,
  saveConnectionConfig,
  HAConnectionError,
  type HAConnectionConfig,
  type RestAuth,
} from "../lib/haClient"
import {
  fetchAreas,
  fetchDeviceRegistry,
  fetchEntityRegistry,
  type HAArea,
  type HADeviceRegistryEntry,
  type HAEntityRegistryEntry,
} from "../lib/haRegistry"
import {
  HomeAssistantContext,
  type ConnectionStatus,
  type HomeAssistantContextValue,
  type WeatherForecastDay,
  type WeatherForecastType,
} from "./homeAssistantContext"

export function HomeAssistantProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [entities, setEntities] = useState<HassEntities>({})
  const [restAuth, setRestAuth] = useState<RestAuth | null>(null)
  const [areas, setAreas] = useState<HAArea[]>([])
  const [entityRegistry, setEntityRegistry] = useState<HAEntityRegistryEntry[]>([])
  const [deviceRegistry, setDeviceRegistry] = useState<HADeviceRegistryEntry[]>([])
  const [registriesLoaded, setRegistriesLoaded] = useState(false)
  const connectionRef = useRef<Connection | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const teardown = useCallback(() => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    connectionRef.current?.close()
    connectionRef.current = null
    setEntities({})
    setRestAuth(null)
    setAreas([])
    setEntityRegistry([])
    setDeviceRegistry([])
    setRegistriesLoaded(false)
  }, [])

  const connect = useCallback(async (config: HAConnectionConfig) => {
    setStatus("connecting")
    setError(null)
    try {
      const conn = await connectToHomeAssistant(config)
      connectionRef.current = conn
      setRestAuth(getRestAuth(conn))
      unsubscribeRef.current = subscribeEntities(conn, (next) => {
        setEntities(next)
      })
      conn.addEventListener("disconnected", () => setStatus("connecting"))
      conn.addEventListener("ready", () => setStatus("connected"))
      saveConnectionConfig(config)
      setStatus("connected")

      const [areaList, entityRegList, deviceRegList] = await Promise.all([
        fetchAreas(conn),
        fetchEntityRegistry(conn),
        fetchDeviceRegistry(conn),
      ])
      setAreas(areaList)
      setEntityRegistry(entityRegList)
      setDeviceRegistry(deviceRegList)
      setRegistriesLoaded(true)
    } catch (err) {
      const key = err instanceof HAConnectionError ? err.translationKey : "error.unknown"
      setError(key)
      setStatus("error")
      throw err
    }
  }, [])

  const disconnect = useCallback(() => {
    teardown()
    clearConnectionConfig()
    setStatus("disconnected")
    setError(null)
  }, [teardown])

  const callService = useCallback<HomeAssistantContextValue["callService"]>(
    async (domain, service, serviceData, target) => {
      if (!connectionRef.current) {
        throw new Error("No active connection to Home Assistant.")
      }
      return haCallService(
        connectionRef.current,
        domain,
        service,
        serviceData,
        target,
      )
    },
    [],
  )

  const subscribeForecast = useCallback(
    (
      entityId: string,
      forecastType: WeatherForecastType,
      callback: (forecast: WeatherForecastDay[]) => void,
    ) => {
      if (!connectionRef.current) {
        return Promise.resolve(() => {})
      }
      return connectionRef.current.subscribeMessage<{ forecast: WeatherForecastDay[] }>(
        (result) => callback(result.forecast ?? []),
        { type: "weather/subscribe_forecast", entity_id: entityId, forecast_type: forecastType },
      )
    },
    [],
  )

  useEffect(() => {
    const stored = loadStoredConnectionConfig()
    if (stored) {
      connect(stored).catch(() => {
        // erreur déjà exposée via `error`/`status`, l'écran de connexion gère l'affichage
      })
    }
    return () => {
      teardown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HomeAssistantContext.Provider
      value={{
        status,
        error,
        entities,
        restAuth,
        areas,
        entityRegistry,
        deviceRegistry,
        registriesLoaded,
        connect,
        disconnect,
        callService,
        subscribeForecast,
      }}
    >
      {children}
    </HomeAssistantContext.Provider>
  )
}
