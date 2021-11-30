import { CampaignApi } from './campaign-api'
import { ConsoleApi } from './console-api'
import { CreatureApi } from './creature-api'
import { MapApi } from './map-api'
import { PlayerApi } from './player-api'
import { UiApi } from './ui-api'

/** API exposed to scripts attached to creatures, items, etc. */
export type ScriptApi = CampaignApi &
ConsoleApi &
CreatureApi &
MapApi &
PlayerApi &
UiApi
