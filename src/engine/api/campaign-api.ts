import { ZoneId } from 'engine/zone-db'

export type CampaignApi = Readonly<{
  /**
   * Causes the player to travel to the specified zone, which will replace the currently active
   * world.
   */
  loadZone: (id: ZoneId) => void
}>
