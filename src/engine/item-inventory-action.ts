import { Creature } from './creature'
import { Item } from './item'
import { World } from './world'

/** An action that a user can perform with items in their inventory. */
export interface ItemInventoryAction {
  /** name of this action, so the user can identity it */
  name: string

  /** invoke the action for the given item, which is in the specified creature's inventory */
  execute: (item: Item, creature: Creature, world: World) => void
}

// fails currently, because recoil 'freezes' our player state
export const drop: ItemInventoryAction = {
  name: 'Drop',
  execute: (item, creature, world) => {
    creature.inventory.remove(item)
    world.map.addItem(creature.x, creature.y, item)
  },
}

export const equip: ItemInventoryAction = {
  name: 'Equip',
  execute: (item, creature) => {
    creature.equip(item)
  },
}

export const unequip: ItemInventoryAction = {
  name: 'Unequip',
  execute: (_item, _creature) => {
    // creature.unequip(item) ??
  },
}
