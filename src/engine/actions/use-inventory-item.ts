import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { Action } from 'engine/types'

/**
 * Action taken by a creature who wants to invoke an item action on an item in their inventory.
 *
 * @param creature the creature using the item
 * @actionName name of the item inventory action to invoke, which must be one provided by the item
 * @item the item to invoke the action on
 * @return true if the action existed and succeeded, otherwise false
 */
export const UseInventoryItemAction = (
  creature: Creature,
  actionName: string,
  item: Item
): Action => (world) => {
  const action = item.getInventoryAction(actionName)
  if (action === undefined) {
    return false
  }

  action.execute(item, creature, world)
  return true
}
