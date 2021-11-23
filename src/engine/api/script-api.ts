import { CampaignApi } from './campaign-api'
import { CreatureApi } from './creature-api'
import { MapApi } from './map-api'
import { UiApi } from './ui-api'

/** API exposed to scripts attached to creatures, items, etc. */
export type ScriptApi = CampaignApi & CreatureApi & MapApi & UiApi & Readonly<{
  /**
   * Shows the specified message to the user, in the expedition log panel
   */
  showMessage (message: string): void
}>
