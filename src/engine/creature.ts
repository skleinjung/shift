import { CreatureType } from 'db/creatures'
import { TypedEventEmitter } from 'typed-event-emitter'

import {
  Attack,
  Attackable,
  AttackResult,
  DamageApplication,
  Defense,
  getCombatRollResult,
  PendingAttack,
} from './combat'
import { Container } from './container'
import { CreatureEvents } from './events'
import { ExpeditionMap } from './map'
import { newId } from './new-id'
import { Actor, Combatant, Damageable, EventSource, Moveable } from './types'
import { World } from './world'

/**
 * A Creature is an Actor subtype that specifically represents a living being.
 */
export class Creature extends TypedEventEmitter<CreatureEvents> implements
  Actor,
  Combatant,
  Damageable,
  Moveable,
  EventSource<CreatureEvents> {
  private _health: number
  private _id = newId()

  /** inventory of items held by this creature */
  public readonly inventory: Container

  constructor (
    private _type: CreatureType,
    private _x: number,
    private _y: number,
    private _map: ExpeditionMap
  ) {
    super()

    if (this._map.getCreatureId(this._x, this._y) !== undefined) {
      throw new Error('TODO: do not fail when adding creature to occupied cell')
    }

    this._health = this._type.healthMax
    this.inventory = new Container(`inv_creature_${this._id}`)
    this._map.setCreatureId(this._x, this._y, this.id)
  }

  public get type () {
    return this._type
  }

  /// ////////////////////////////////////////////
  // Entity

  public get id () {
    return this._id
  }

  /** name of this creature */
  public get name () {
    return this._type.name
  }

  /// ////////////////////////////////////////////
  // Actor

  public getAction (world: World) {
    return this._type.behavior(this, world)
  }

  /// ////////////////////////////////////////////
  // Combatant (Attacker)

  public generateAttack (_target: Attackable): Attack {
    return {
      roll: getCombatRollResult(this._type.melee),
    }
  }

  public onAttackComplete (result: AttackResult) {
    this.emit('attack', result, this)
  }

  /// ////////////////////////////////////////////
  // Combatant (Attackable)

  public generateDefense (_attack: Attack): Defense {
    return {
      immune: false,
      roll: getCombatRollResult(this._type.defense),
    }
  }

  public onHit (attack: PendingAttack): DamageApplication | null {
    const oldHealth = this.health
    this.onDamage(attack.damageRolled)
    const taken = Math.max(0, oldHealth - this.health)
    const overkill = attack.damageRolled - taken

    return overkill > 0 ? {
      taken,
      overkill,
    } : {
      taken,
    }
  }

  /// ////////////////////////////////////////////
  // Damageable

  /** flag indicating if this creature is dead or not */
  public get dead () {
    return this._health < 1
  }

  /** creature's current health */
  public get health () {
    return this._health
  }

  /**
   * Assign a specified amount of damage to this creature.
   */
  public onDamage (amount: number) {
    this._health = Math.max(0, this._health - amount)

    if (this._health < 1) {
      this.emit('death', this)
    }
  }

  /// ////////////////////////////////////////////
  // Moveable

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
}
