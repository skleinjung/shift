import { newId } from './new-id'
import { Entity } from './types'

/**
 * An Item represents a uniqueable identifiable item in the game world. This could include dungeon
 * features that are not actors, treasure on the ground, equipment carried by a creature, and so
 * on.
 */
export class Item implements Entity {
  public readonly id = newId()

  constructor (
    public readonly name: string
  ) { /* noop */ }
}
