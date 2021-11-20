import { CreatureApi } from './creature-api'
import { MapApi } from './map-api'
import { UiApi } from './ui-api'

/** API exposed to scripts attached to creatures, items, etc. */
export type ScriptApi = CreatureApi & MapApi & UiApi
