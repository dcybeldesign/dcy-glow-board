import type { ReactElement } from "react"
import {
  BulbIcon,
  PlugIcon,
  ThermometerIcon,
  DropletIcon,
  BoltIcon,
  ActivityIcon,
  BlindsIcon,
  GarageIcon,
  FanIcon,
  LockClosedIcon,
  LockOpenIcon,
  DoorIcon,
  EyeIcon,
  AlertTriangleIcon,
  WifiIcon,
  BatteryIcon,
  TapIcon,
  WandIcon,
  PlayIcon,
  SnowflakeIcon,
  FlameIcon,
  AutoModeIcon,
  PowerIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  CloudSunIcon,
  RainIcon,
  SnowIcon,
  FogIcon,
  WindIcon,
  StormIcon,
  TvIcon,
  SpeakerIcon,
  CameraIcon,
  VacuumIcon,
  ShieldIcon,
  SirenIcon,
  CalendarIcon,
  TimerIcon,
  PersonIcon,
  CarIcon,
  GaugeIcon,
  LungsIcon,
  ValveIcon,
  UpdateIcon,
} from "./deviceIcons"
import { Bed, CookingPot, Bath, Leaf, DoorOpen, Sofa, Archive, House, SettingsIcon } from "./roomVisuals"
import type { TranslationKey } from "./i18n"

export type IconCatalogEntry = {
  id: string
  label: TranslationKey
  keywords: string[]
  Icon: () => ReactElement
}

export const ICON_CATALOG: IconCatalogEntry[] = [
  { id: "bulb", label: "icon.bulb", keywords: ["lumière", "lampe", "ampoule", "light", "bulb"], Icon: BulbIcon },
  { id: "plug", label: "icon.plug", keywords: ["prise", "switch", "plug"], Icon: PlugIcon },
  { id: "thermometer", label: "icon.thermometer", keywords: ["température", "thermomètre", "temp", "thermometer"], Icon: ThermometerIcon },
  { id: "droplet", label: "icon.droplet", keywords: ["humidité", "eau", "goutte", "pluie", "humidity", "water", "droplet"], Icon: DropletIcon },
  { id: "bolt", label: "icon.bolt", keywords: ["énergie", "électricité", "puissance", "éclair", "energy", "power", "bolt"], Icon: BoltIcon },
  { id: "activity", label: "icon.activity", keywords: ["activité", "capteur", "signal", "activity", "sensor"], Icon: ActivityIcon },
  { id: "blinds", label: "icon.blinds", keywords: ["volet", "store", "fenêtre", "blinds", "cover"], Icon: BlindsIcon },
  { id: "garage", label: "icon.garage", keywords: ["garage", "porte de garage", "garage door"], Icon: GarageIcon },
  { id: "fan", label: "icon.fan", keywords: ["ventilateur", "ventilation", "air", "fan"], Icon: FanIcon },
  { id: "lock-closed", label: "icon.lock-closed", keywords: ["serrure", "verrou", "fermé", "sécurité", "lock", "locked"], Icon: LockClosedIcon },
  { id: "lock-open", label: "icon.lock-open", keywords: ["serrure", "verrou", "ouvert", "unlocked"], Icon: LockOpenIcon },
  { id: "door", label: "icon.door", keywords: ["porte", "entrée", "door"], Icon: DoorIcon },
  { id: "eye", label: "icon.eye", keywords: ["mouvement", "présence", "surveillance", "œil", "caméra", "motion", "presence"], Icon: EyeIcon },
  { id: "alert", label: "icon.alert", keywords: ["alerte", "danger", "fumée", "gaz", "problème", "alert", "smoke"], Icon: AlertTriangleIcon },
  { id: "wifi", label: "icon.wifi", keywords: ["wifi", "réseau", "connexion", "network"], Icon: WifiIcon },
  { id: "battery", label: "icon.battery", keywords: ["batterie", "pile", "battery"], Icon: BatteryIcon },
  { id: "tap", label: "icon.tap", keywords: ["bouton", "appui", "button"], Icon: TapIcon },
  { id: "wand", label: "icon.wand", keywords: ["scène", "magie", "baguette", "scene"], Icon: WandIcon },
  { id: "play", label: "icon.play", keywords: ["script", "lecture", "exécuter", "automatisation", "run"], Icon: PlayIcon },
  { id: "snowflake", label: "icon.snowflake", keywords: ["froid", "climatisation", "clim", "flocon", "cold", "cool"], Icon: SnowflakeIcon },
  { id: "flame", label: "icon.flame", keywords: ["chaud", "chauffage", "flamme", "feu", "hot", "heat"], Icon: FlameIcon },
  { id: "auto-mode", label: "icon.auto-mode", keywords: ["auto", "automatique"], Icon: AutoModeIcon },
  { id: "power", label: "icon.power", keywords: ["marche", "arrêt", "power", "alimentation"], Icon: PowerIcon },
  { id: "sun", label: "icon.sun", keywords: ["météo", "soleil", "ensoleillé", "beau temps", "sun", "sunny"], Icon: SunIcon },
  { id: "moon", label: "icon.moon", keywords: ["météo", "lune", "nuit", "clair de nuit", "moon", "night"], Icon: MoonIcon },
  { id: "cloud", label: "icon.cloud", keywords: ["météo", "nuage", "nuageux", "couvert", "cloud", "cloudy"], Icon: CloudIcon },
  { id: "cloud-sun", label: "icon.cloud-sun", keywords: ["météo", "éclaircies", "partiellement nuageux", "soleil voilé", "partly cloudy"], Icon: CloudSunIcon },
  { id: "rain", label: "icon.rain", keywords: ["météo", "pluie", "pluvieux", "averse", "rain"], Icon: RainIcon },
  { id: "snow", label: "icon.snow", keywords: ["météo", "neige", "neigeux", "snow"], Icon: SnowIcon },
  { id: "fog", label: "icon.fog", keywords: ["météo", "brouillard", "brume", "fog"], Icon: FogIcon },
  { id: "wind", label: "icon.wind", keywords: ["météo", "vent", "venteux", "rafale", "wind"], Icon: WindIcon },
  { id: "storm", label: "icon.storm", keywords: ["météo", "orage", "tonnerre", "foudre", "storm", "lightning"], Icon: StormIcon },
  { id: "tv", label: "icon.tv", keywords: ["télé", "télévision", "tv", "média", "écran"], Icon: TvIcon },
  { id: "speaker", label: "icon.speaker", keywords: ["enceinte", "musique", "son", "haut-parleur", "média", "speaker", "music"], Icon: SpeakerIcon },
  { id: "camera", label: "icon.camera", keywords: ["caméra", "vidéo", "surveillance", "camera", "video"], Icon: CameraIcon },
  { id: "vacuum", label: "icon.vacuum", keywords: ["aspirateur", "robot", "ménage", "nettoyage", "vacuum", "cleaning"], Icon: VacuumIcon },
  { id: "shield", label: "icon.shield", keywords: ["alarme", "sécurité", "bouclier", "protection", "alarm", "security"], Icon: ShieldIcon },
  { id: "siren", label: "icon.siren", keywords: ["sirène", "alerte sonore", "klaxon", "siren"], Icon: SirenIcon },
  { id: "calendar", label: "icon.calendar", keywords: ["calendrier", "agenda", "date", "événement", "calendar"], Icon: CalendarIcon },
  { id: "timer", label: "icon.timer", keywords: ["minuteur", "timer", "compte à rebours", "horloge"], Icon: TimerIcon },
  { id: "person", label: "icon.person", keywords: ["personne", "présence", "utilisateur", "famille", "person"], Icon: PersonIcon },
  { id: "car", label: "icon.car", keywords: ["voiture", "véhicule", "auto", "localisation", "car", "vehicle"], Icon: CarIcon },
  { id: "gauge", label: "icon.gauge", keywords: ["pression", "baromètre", "jauge", "atmosphère", "pressure"], Icon: GaugeIcon },
  { id: "lungs", label: "icon.lungs", keywords: ["air", "qualité de l'air", "co2", "pollution", "particules", "air quality"], Icon: LungsIcon },
  { id: "valve", label: "icon.valve", keywords: ["vanne", "robinet", "gaz", "eau", "arrivée", "valve"], Icon: ValveIcon },
  { id: "update", label: "icon.update", keywords: ["mise à jour", "firmware", "logiciel", "update"], Icon: UpdateIcon },
  { id: "bed", label: "icon.bed", keywords: ["chambre", "lit", "bureau", "dormir", "bedroom", "bed"], Icon: Bed },
  { id: "cooking-pot", label: "icon.cooking-pot", keywords: ["cuisine", "cuisson", "marmite", "kitchen"], Icon: CookingPot },
  { id: "bath", label: "icon.bath", keywords: ["salle de bain", "douche", "wc", "toilette", "bain", "bathroom"], Icon: Bath },
  { id: "leaf", label: "icon.leaf", keywords: ["jardin", "terrasse", "balcon", "plante", "extérieur", "garden", "outdoor"], Icon: Leaf },
  { id: "door-open", label: "icon.door-open", keywords: ["couloir", "entrée", "hall", "entryway", "hallway"], Icon: DoorOpen },
  { id: "sofa", label: "icon.sofa", keywords: ["salon", "séjour", "canapé", "living room", "sofa"], Icon: Sofa },
  { id: "archive", label: "icon.archive", keywords: ["cellier", "cave", "garage", "buanderie", "grenier", "rangement", "storage"], Icon: Archive },
  { id: "house", label: "icon.house", keywords: ["maison", "général", "accueil", "home"], Icon: House },
  { id: "settings-gear", label: "icon.settings-gear", keywords: ["réglages", "paramètres", "engrenage", "settings"], Icon: SettingsIcon },
]

export function findIconEntry(id: string | undefined) {
  if (!id) return undefined
  return ICON_CATALOG.find((entry) => entry.id === id)
}

export function renderIcon(id: string | undefined): ReactElement | undefined {
  const entry = findIconEntry(id)
  return entry ? <entry.Icon /> : undefined
}
