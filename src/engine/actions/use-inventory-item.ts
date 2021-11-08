import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { Action } from 'engine/types'
import { World } from 'engine/world'
import { toLower } from 'lodash'

/**
 * Action taken by a creature who wants to invoke an item action on an item in their inventory.
 *
 * @param creature the creature using the item
 * @actionName name of the item inventory action to invoke, which must be one provided by the item
 * @item the item to invoke the action on
 * @return true if the action existed and succeeded, otherwise false
 */
export class UseInventoryItemAction implements Action {
  constructor (
    private _creature: Creature,
    private _actionName: string,
    private _item: Item
  ) { }

  public execute (world: World) {
    const action = this._item.getInventoryAction(this._actionName)
    if (action === undefined) {
      return `${this._creature.name} does not know how to "${toLower(this._actionName)}" ${this._item.name}.`
    }

    return action.execute(this._item, this._creature, world)
  }
}
