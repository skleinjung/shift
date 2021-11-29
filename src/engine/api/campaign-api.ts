import { ZoneId } from 'engine/zone-db'

export type CampaignApi = Readonly<{
  /** Returns the number of times the player has visited the specified zone. */
  getTimesVisited: (id: ZoneId) => number

  /** Returns true if the player has visited the specified zone previously */
  hasVisited: (id: ZoneId) => boolean

  /**
   * Causes the player to travel to the specified zone, which will replace the currently active
   * world.
   */
  loadZone: (id: ZoneId) => void
}>
