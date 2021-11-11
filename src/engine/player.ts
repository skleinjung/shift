import { PlayerBehavior } from './behaviors/player-behavior'
import { Creature } from './creature'
import { CreatureTypes } from './creature-db'
import { CellCoordinate } from './map/map'
import { Action } from './types'
import { World } from './world'

export const InitialLinkValue = 5000

export class Player extends Creature {
  private _link = InitialLinkValue

  /** destination being auto-moved towards */
  public destination: CellCoordinate | undefined

  /** next action the player has selected */
  public nextAction: Action | undefined

  constructor () {
    super(CreatureTypes.player, 0, 0)
    this._behavior = PlayerBehavior(this)
  }

  /**
   * Returns the current strength of the player's link
   */
  public get link () {
    return this._link
  }

  /** Each turn, decrease the link strength */
  public turnEnded (world: World): void {
    super.turnEnded(world)
    this._link--
  }
}

// fake inventory for testing
// this._player.inventory.addItem(new Item({ name: 'a coconut' }))
// this._player.inventory.addItem(new Item({ name: 'hopes and dreams' }))

// const spear = createWeapon('+100 spear', 100)
// this._player.inventory.addItem(spear)

//     const armor = createArmor('amazing, glowing armor', 100, `Lorem ipsum dolor sit amet,
// consectetur adipiscing elit. Aenean pharetra est id velit laoreet, eu semper lectus ullamcorper.
// Nunc pellentesque nunc ex, eu venenatis orci mattis non. Maecenas in justo mollis, luctus urna
// porttitor, imperdiet lectus. Quisque sit amet quam venenatis, iaculis sapien in, rutrum dui.`)
// this._player.inventory.addItem(armor)

// this.map.addItem(-2, 0, createWeapon('+1 spear', 1))
// this.map.addItem(2, 0, createWeapon('+2 spear', 2))
// this.map.addItem(2, 0, createWeapon('+3 spear', 3))

// const leather = ItemTemplates.leather_armor.create()
// this.map.addItem(0, 2, leather)
