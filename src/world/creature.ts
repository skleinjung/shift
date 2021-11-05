import { CreatureType } from 'db/creatures'
import { TypedEventEmitter } from 'typed-event-emitter'

import {
  Attack,
  Attackable,
  Attacker,
  AttackResult,
  DamageApplication,
  Defense,
  getCombatRollResult,
  PendingAttack,
} from './combat'
import { CreatureEvents } from './events'
import { ExpeditionMap } from './map'

/**
 * TODO: emit events instead of directly updating map
 */
export class Creature extends TypedEventEmitter<CreatureEvents> implements Attackable, Attacker {
  private _health: number

  constructor (
    public readonly id: number,
    public readonly type: CreatureType,
    private _x: number,
    private _y: number,
    private _map: ExpeditionMap
  ) {
    super()

    if (this._map.getCreatureId(this._x, this._y) !== undefined) {
      throw new Error('TODO: do not fail when adding creature to occupied cell')
    }

    this._health = type.healthMax
    this._map.setCreatureId(this._x, this._y, this.id)
  }

  /** flag indicating if this creature is dead or not */
  public get dead () {
    return this._health < 1
  }

  /** creature's current health */
  public get health () {
    return this._health
  }

  /** name of this creature */
  public get name () {
    return this.type.name
  }

  /** creature's x position on the map */
  public get x () {
    return this._x
  }

  /** creature's y position on the map */
  public get y () {
    return this._y
  }

  /**
   * Moves a creature the specified distance in each axis. If the move is impossible, will return false.
   * If the move is completed, then true is returned.
   */
  public moveBy (x: number, y: number) {
    const newX = this._x + x
    const newY = this._y + y

    if (!this._map.isTraversable(newX, newY)) {
      return false
    }

    if (this._map.getCreatureId(this._x, this._y) === this.id) {
      this._map.setCreatureId(this._x, this._y, undefined)
    }

    this._x = newX
    this._y = newY

    this._map.setCreatureId(this._x, this._y, this.id)
    return true
  }

  /**
   * Assign a specified amount of damage to this creature.
   */
  public takeDamage (amount: number) {
    this._health = Math.max(0, this._health - amount)

    if (this._health < 1) {
      this.emit('death', this)
    }
  }

  // Combat interfaces

  public generateAttack (_target: Attackable): Attack {
    return {
      roll: getCombatRollResult(this.type.melee),
    }
  }

  public generateDefense (_attack: Attack): Defense {
    return {
      immune: false,
      roll: getCombatRollResult(this.type.defense),
    }
  }

  public onAttackComplete (result: AttackResult) {
    this.emit('attack', result)
  }

  public onHit (attack: PendingAttack): DamageApplication | null {
    const oldHealth = this.health
    this.takeDamage(attack.damageRolled)
    const taken = Math.max(0, oldHealth - this.health)
    const overkill = attack.damageRolled - taken

    return overkill > 0 ? {
      taken,
      overkill,
    } : {
      taken,
    }
  }
}
