import { Creature } from './creature'
import { World } from './world'

export const InitialLinkValue = 5000

export class Player extends Creature {
  private _link = InitialLinkValue

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
