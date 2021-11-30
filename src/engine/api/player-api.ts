import { Player } from 'engine/player'

export type PlayerApi = Readonly<{
  /** Retrieves the Creature corresponding to the player. */
  player: Player
}>
