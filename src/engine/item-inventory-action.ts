import { Creature } from './creature'
import { Item } from './item'
import { Action } from './types'
import { World } from './world'

/** An action that a user can perform with items in their inventory. */
export interface ItemInventoryAction {
  /** name of this action, so the user can identity it */
  name: string

  /** invoke the action for the given item, which is in the specified creature's inventory */
  execute: (item: Item, creature: Creature, world: World) => ReturnType<Action['execute']>
}

export const drop: ItemInventoryAction = {
  name: 'Drop',
  execute: (item, creature, world) => {
    if (creature.isEquipped(item)) {
      return {
        message: `${creature.name} must unequip the ${item.name} before they can drop it.`,
        ok: false,
      }
    }

    creature.inventory.removeItem(item)
    world.map.addItem(creature.x, creature.y, item)
    return `${creature.name} dropped ${item.name}.`
  },
}

export const equip: ItemInventoryAction = {
  name: 'Equip',
  execute: (item, creature) => {
    if (!creature.equip(item)) {
      return {
        message: `${creature.name} was unable to equip the ${item.name}.`,
        ok: false,
      }
    }

    return `${creature.name} equipped the ${item.name}.`
  },
}

export const unequip: ItemInventoryAction = {
  name: 'Unequip',
  execute: (_item, _creature) => {
    // creature.unequip(item) ??
  },
}
