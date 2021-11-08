import TypedEmitter from 'typed-emitter'

import { Attackable, Attacker } from './combat'
import { World } from './world'

/**
 * An action taken by a creature during a turn. Will be passed the acting creature, and an instance of
 * the world.
 *
 * TODO: return success/fail
 */
export type Action = (world: World) => void

/** Methods expoed by objects that emit events defined by type 'T' */
export type EventSource<T> = Omit<TypedEmitter<T>,
'emit'
| 'rawListeners'
| 'listeners'
| 'listenersCount'
| 'getMaxListeners'
| 'setMaxListeners'>

/**
 * An entity represents a 'noun' in the game world that has a unique, persistent identity. It
 * can be a person or monster, object, etc.
 *
 * The most basic information on an entity exists to identify it, and describe it to the player.
 */
export interface Entity {
  /** unique identifier for this entity */
  id: number

  /** display name of this entity */
  name: string
}

/**
 * An Actor is a subtype of entity that participates in the game loop, and is capable of independent
 * action. It is also notified of the passing of each turn, in case of passive effects.
 */
export interface Actor extends Entity {
  /**
   * Given the current world state, return the actor's next action. If the actor is not ready to
   * select an action, `undefined` is return.
   *
   * An undefined return is intended to be used for asynchronous action selection (such as from a
   * network call or UI event). Be wary of infinite loops if an AI-controlled actor fails to produce
   * an action.
   **/
  getAction: (world: World) => Action | undefined

  /**
   * Called by the engine after each turn passes.
   */
  turnEnded: (world: World) => void
}

/** A Positionable entity has coordinates on the map grid. */
export interface Positionable extends Entity {
  /** entity's x position on the map */
  x: number

  /** entity's y position on the map */
  y: number
}

/** A Moveable entity has a map position, and methods for updating that position. */
export interface Moveable extends Positionable {
  /**
   * Moves a creature the specified distance in each axis.
   */
  moveBy: (x: number, y: number) => void
}

/** A Damageable entity has a health pool, and can take damage and 'die'. */
export interface Damageable extends Entity {
  /** flag indicating if this entity is dead or not */
  dead: boolean

  /** entity's current health */
  health: number

  /** called to notify the entity that it has been dealt damage */
  onDamage: (amount: number) => void
}

/** A Combatant has the methods for fully participating in combat, both attacking and defending. */
export type Combatant = Entity & Attacker & Attackable
