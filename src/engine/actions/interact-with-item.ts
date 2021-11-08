import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { Action } from 'engine/types'
import { World } from 'engine/world'

/**
 * Action taken by a creature who wants to interact with an item in their map cell that they are not
 * carrying.
 *
 * @param creature the creature interacting with the item
 * @actionName name of the item interaction to invoke, which must be one provided by the item
 * @item the item to interact with
 * @return true if the action existed and succeeded, otherwise false
 */
export class InteractWithItemAction implements Action {
  constructor (
    private _creature: Creature,
    private _interactionName: string,
    private _item: Item
  ) { }

  public execute (world: World) {
    const action = this._item.getInteraction(this._interactionName)
    if (action === undefined) {
      return false
    }

    action.execute(this._item, this._creature, world)
    return true
  }
}
