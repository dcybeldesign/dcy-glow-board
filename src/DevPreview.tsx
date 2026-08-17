import type { HassEntities } from "home-assistant-js-websocket"
import {
  HomeAssistantContext,
  type HomeAssistantContextValue,
} from "./context/homeAssistantContext"
import { Dashboard } from "./components/Dashboard"

const now = new Date().toISOString()
const baseAttrs = {
  last_changed: now,
  last_updated: now,
  context: { id: "x", parent_id: null, user_id: null },
}

const fakeAreas = [
  { area_id: "living_room", name: "Living Room" },
  { area_id: "kitchen", name: "Kitchen" },
  { area_id: "bedroom", name: "Bedroom" },
  { area_id: "entryway", name: "Entryway" },
  { area_id: "garden", name: "Garden" },
  { area_id: "office", name: "Office" },
].map((a) => ({ ...a, icon: null }))

// entity_id -> area_id, used to build the fake entity registry below. Each
// area gets a small, deliberately varied set of domains/styles so the demo
// screenshots read as a real home rather than one room with everything
// dumped into it.
const entityAreas: Record<string, string> = {
  "light.living_room_ceiling": "living_room",
  "climate.living_room_thermostat": "living_room",
  "media_player.living_room_tv": "living_room",
  "cover.living_room_blinds": "living_room",
  "sensor.living_room_temperature": "living_room",
  "scene.movie_night": "living_room",

  "light.kitchen_ceiling": "kitchen",
  "switch.kitchen_coffee_maker": "kitchen",
  "sensor.kitchen_humidity": "kitchen",
  "binary_sensor.kitchen_window": "kitchen",

  "light.bedroom_lamp": "bedroom",
  "climate.bedroom_ac": "bedroom",
  "sensor.bedroom_temperature": "bedroom",
  "binary_sensor.bedroom_motion": "bedroom",

  "lock.front_door": "entryway",
  "alarm_control_panel.home": "entryway",
  "camera.front_door": "entryway",
  "binary_sensor.front_door": "entryway",

  "weather.home": "garden",
  "sensor.garden_temperature": "garden",
  "cover.garden_awning": "garden",

  "fan.office": "office",
  "vacuum.office_robot": "office",
  "sensor.office_co2": "office",
  "button.office_focus_mode": "office",
}

const fakeEntities = {
  // Living Room
  "light.living_room_ceiling": {
    entity_id: "light.living_room_ceiling",
    state: "on",
    attributes: { friendly_name: "Ceiling Light", brightness: 190 },
    ...baseAttrs,
  },
  "climate.living_room_thermostat": {
    entity_id: "climate.living_room_thermostat",
    state: "heat",
    attributes: {
      friendly_name: "Thermostat",
      current_temperature: 20.5,
      temperature: 21,
      current_humidity: 47,
      target_temp_step: 0.5,
      hvac_action: "heating",
      hvac_modes: ["off", "heat", "cool", "auto"],
    },
    ...baseAttrs,
  },
  "media_player.living_room_tv": {
    entity_id: "media_player.living_room_tv",
    state: "playing",
    attributes: {
      friendly_name: "TV",
      volume_level: 0.62,
      app_name: "Streaming",
      media_title: "Season Finale",
      media_duration: 2760,
      media_position: 640,
    },
    ...baseAttrs,
  },
  "cover.living_room_blinds": {
    entity_id: "cover.living_room_blinds",
    state: "open",
    attributes: { friendly_name: "Blinds", current_position: 60 },
    ...baseAttrs,
  },
  "sensor.living_room_temperature": {
    entity_id: "sensor.living_room_temperature",
    state: "20.5",
    attributes: { friendly_name: "Temperature", device_class: "temperature", unit_of_measurement: "°C" },
    ...baseAttrs,
  },
  "scene.movie_night": {
    entity_id: "scene.movie_night",
    state: "unknown",
    attributes: { friendly_name: "Movie Night" },
    ...baseAttrs,
  },

  // Kitchen
  "light.kitchen_ceiling": {
    entity_id: "light.kitchen_ceiling",
    state: "on",
    attributes: { friendly_name: "Ceiling Light", brightness: 220 },
    ...baseAttrs,
  },
  "switch.kitchen_coffee_maker": {
    entity_id: "switch.kitchen_coffee_maker",
    state: "off",
    attributes: { friendly_name: "Coffee Maker" },
    ...baseAttrs,
  },
  "sensor.kitchen_humidity": {
    entity_id: "sensor.kitchen_humidity",
    state: "58",
    attributes: { friendly_name: "Humidity", device_class: "humidity", unit_of_measurement: "%" },
    ...baseAttrs,
  },
  "binary_sensor.kitchen_window": {
    entity_id: "binary_sensor.kitchen_window",
    state: "off",
    attributes: { friendly_name: "Window", device_class: "window" },
    ...baseAttrs,
  },

  // Bedroom
  "light.bedroom_lamp": {
    entity_id: "light.bedroom_lamp",
    state: "on",
    attributes: {
      friendly_name: "Bedside Lamp",
      brightness: 120,
      rgb_color: [178, 102, 255],
      supported_color_modes: ["color_temp", "rgb"],
      min_color_temp_kelvin: 2000,
      max_color_temp_kelvin: 6500,
    },
    ...baseAttrs,
  },
  "climate.bedroom_ac": {
    entity_id: "climate.bedroom_ac",
    state: "cool",
    attributes: {
      friendly_name: "AC",
      current_temperature: 24,
      temperature: 21,
      current_humidity: 52,
      target_temp_step: 0.5,
      min_temp: 16,
      max_temp: 30,
      hvac_action: "cooling",
      hvac_modes: ["off", "cool", "heat", "auto"],
    },
    ...baseAttrs,
  },
  "sensor.bedroom_temperature": {
    entity_id: "sensor.bedroom_temperature",
    state: "22.1",
    attributes: { friendly_name: "Temperature", device_class: "temperature", unit_of_measurement: "°C" },
    ...baseAttrs,
  },
  "binary_sensor.bedroom_motion": {
    entity_id: "binary_sensor.bedroom_motion",
    state: "off",
    attributes: { friendly_name: "Motion", device_class: "motion" },
    ...baseAttrs,
  },

  // Entryway
  "lock.front_door": {
    entity_id: "lock.front_door",
    state: "locked",
    attributes: { friendly_name: "Front Door" },
    ...baseAttrs,
  },
  "alarm_control_panel.home": {
    entity_id: "alarm_control_panel.home",
    state: "armed_away",
    attributes: {
      friendly_name: "Home Alarm",
      code_format: "number",
      code_arm_required: true,
      supported_features: 1 | 2 | 4,
    },
    ...baseAttrs,
  },
  "camera.front_door": {
    entity_id: "camera.front_door",
    state: "idle",
    attributes: { friendly_name: "Doorbell Camera" },
    ...baseAttrs,
  },
  "binary_sensor.front_door": {
    entity_id: "binary_sensor.front_door",
    state: "off",
    attributes: { friendly_name: "Front Door", device_class: "door" },
    ...baseAttrs,
  },

  // Garden
  "weather.home": {
    entity_id: "weather.home",
    state: "partlycloudy",
    attributes: {
      friendly_name: "Weather",
      temperature: 22,
      temperature_unit: "°C",
      humidity: 58,
      wind_speed: 14,
      wind_speed_unit: "km/h",
    },
    ...baseAttrs,
  },
  "sensor.garden_temperature": {
    entity_id: "sensor.garden_temperature",
    state: "29.4",
    attributes: { friendly_name: "Outdoor Temperature", device_class: "temperature", unit_of_measurement: "°C" },
    ...baseAttrs,
  },
  "cover.garden_awning": {
    entity_id: "cover.garden_awning",
    state: "closed",
    attributes: { friendly_name: "Awning", current_position: 0 },
    ...baseAttrs,
  },

  // Office
  "fan.office": {
    entity_id: "fan.office",
    state: "on",
    attributes: { friendly_name: "Ventilation Fan", percentage: 45 },
    ...baseAttrs,
  },
  "vacuum.office_robot": {
    entity_id: "vacuum.office_robot",
    state: "cleaning",
    attributes: {
      friendly_name: "Robot Vacuum",
      battery_level: 68,
      supported_features: 0,
    },
    ...baseAttrs,
  },
  "sensor.office_co2": {
    entity_id: "sensor.office_co2",
    state: "612",
    attributes: { friendly_name: "CO2", device_class: "carbon_dioxide", unit_of_measurement: "ppm" },
    ...baseAttrs,
  },
  "button.office_focus_mode": {
    entity_id: "button.office_focus_mode",
    state: "unknown",
    attributes: { friendly_name: "Focus Mode" },
    ...baseAttrs,
  },
} as unknown as HassEntities

const fakeEntityRegistry = Object.keys(fakeEntities).map((entity_id) => ({
  entity_id,
  area_id: entityAreas[entity_id] ?? null,
  device_id: null,
  hidden_by: null,
  entity_category: null,
}))

const fakeContext: HomeAssistantContextValue = {
  status: "connected",
  error: null,
  entities: fakeEntities,
  restAuth: null,
  areas: fakeAreas,
  entityRegistry: fakeEntityRegistry,
  deviceRegistry: [],
  registriesLoaded: true,
  connect: async () => {},
  disconnect: () => {},
  callService: async () => undefined,
  subscribeForecast: async (_entityId, forecastType, callback) => {
    const conditions = ["sunny", "partlycloudy", "cloudy", "rainy", "sunny", "windy", "clear-night"]
    const now = new Date()

    if (forecastType === "hourly") {
      callback(
        Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now)
          d.setHours(d.getHours() + i)
          return {
            datetime: d.toISOString(),
            condition: conditions[i % conditions.length],
            temperature: 24 - Math.abs(6 - i),
          }
        }),
      )
      return () => {}
    }

    callback(
      conditions.map((condition, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() + i)
        return { datetime: d.toISOString(), condition, temperature: 24 - i, templow: 14 + i }
      }),
    )
    return () => {}
  },
}

export function DevPreview() {
  return (
    <HomeAssistantContext.Provider value={fakeContext}>
      <Dashboard />
    </HomeAssistantContext.Provider>
  )
}
