import { Creature } from 'engine/creature'
import { CreatureTypeId } from 'engine/creature-db'

export type CreatureApi = Readonly<{
  /**
   * Adds a creature to the game world at the specified coordinates. The ID of the newly added
   * creature is returned. Will fail if the space is occupied.
   */
  addCreature (type: CreatureTypeId, x: number, y: number): number
  addCreature (creature: Creature): number

  /** Read-only set of all creatures */
  creatures: readonly Creature[]

  /** Retrieves the Creature corresponding to the player. */
  player: Creature

  /**
  * Moves the specified creature to the new (x, y) location. Will fail if the new space is occupied
  * or the creature does not exist.
  */
  moveCreature (id: number, x: number, y: number): void

  /**
  * Immediately removes the creature with the specified ID from the world. Will fail silently if there
  * is no creature with that ID.
  */
  removeCreature (id: number): void
}>
