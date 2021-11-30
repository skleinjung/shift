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
    world.logMessage('giving item: ' + this._item.name + ' to ' + this._recipient.name)
    this._creature.inventory.removeItem(this._item)
  }
}
