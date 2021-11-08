import { Creature } from './creature'
import { Item } from './item'
import { World } from './world'

/** An action that a user can perform with items that are in their map cell, but not held by them. */
export interface ItemInteraction {
  /** name of this action, so the user can identity it */
  name: string

  /** invoke the interaction for the given item, which is in the same map cell as the creature */
  execute: (item: Item, creature: Creature, world: World) => void
}

/** gets an item from the ground, and adds it to the creature's inventory */
export const get: ItemInteraction = {
  name: 'Get',
  execute: (item, creature, world) => {
    world.map.removeItem(creature.x, creature.y, item)
    creature.inventory.addItem(item)
  },
}
