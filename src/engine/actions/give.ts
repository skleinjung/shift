import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { Action } from 'engine/types'
import { World } from 'engine/world'

export class GiveAction implements Action {
  constructor (
    private _creature: Creature,
    private _item: Item,
    private _recipient: Creature
  ) { }

  public execute (world: World) {
    if (!this._recipient.trade(this._item, this._creature)) {
      world.logMessage(`> Trade: ${this._recipient.name} does not want that.`)
    }
  }
}
