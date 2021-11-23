import TypedEmitter from 'typed-emitter'

import { ScriptApi } from './api/script-api'
import { Attackable, Attacker } from './combat'
import { Creature } from './creature'
import { World } from './world'

/**
 * An updateable object recieves timer-based callbacks from the engine, and is able to complete asynchronous
 * tasks that do not require on events being emitted, callbacks, etc.
 */
export interface Updateable {
  /** whether this entity is current recieving updates */
  paused: boolean

  /** update is called at the game engine's tick frequency whenever this updateable is active */
  update: () => void
}

export type ActionResult = {
  /** optional message to show the user, explaining the action's outcome or reason for failure */
  message?: string

  /** whether the action succeeded or not */
  ok: boolean
}

/**
 * An action taken by a creature during a turn. Will be passed the an instance of the world. To support
 * easier implementations of actions, the return type provides several options:
 *
 *   - no return value: indicates success, and no message is logged
 *   - string value: indicates success, and the returned message is logged
 *   - boolean value: dictates success/failure status, and no message is logged
 *   - ActionResult object: specifies both outcome and message
 *
 * @return the result of the action
 */
export interface Action {
  execute: (world: World) => ActionResult | string | boolean | void
}

export interface Command {
  execute: (options: string[], api: ScriptApi) => void
}

/**
 * A behavior provides a function that generates an action for a creature during each turn. If a
 * player actor's behavior returns undefined, the game state will halt updates until it returns a
 * defined value. If a non-player returns undefined, it will be skipped (it's turn treated as 'do
 * nothing').
 **/
export type Behavior = (creature: Creature, world: World) => Action | undefined

/** function that is able to create behaviors */
export type BehaviorFactory = () => Behavior

/** Methods expoed by objects that emit events defined by type 'T' */
export type EventSource<T> = Omit<TypedEmitter<T>,
'emit'
| 'rawListeners'
| 'listeners'
| 'listenersCount'
| 'getMaxListeners'
| 'setMaxListeners'>

/**
 * Interface for objects that store data to be used by scripts.
 */
export interface Scriptable {
  /**
   * Gets the script property with the given key from the creature. If the optional property is
   * false, an error will be thrown if it does not exist.
   */
  getScriptData <T = unknown>(key: string): T
  getScriptData <T = unknown>(key: string, optional?: false): T
  getScriptData <T = unknown>(key: string, optional: true): T | undefined
  getScriptData <T = unknown>(key: string, optional?: boolean): T | undefined

  /** Sets the script property with the specified key to the data value on the creature. */
  setScriptData <T = any> (key: string, data: T): void
}

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
   * Score indicating the acquired 'energy' needed to perform an action.
   *
   * Performing an action decrements this value by an amount that varies depending on the action. Each
   * turn, the actor's initiative is increased by their 'speed' attribute. As long as the initiative
   * is positive, the actor may take an action. (This action may cause the score to go negative, in
   * which they will ahve to wait for the initiative to recharge.)
   */
  initiative: number

  /**
   * Rate at which initiative is recovered. Higher values mean an acotr will get more actions in
   * a given time, relative to actors with lower speeds. See #initiative for more details.
   */
  speed: number

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
  onTurnEnd: () => void

  /**
   * Called by the engine before each turn begins.
   */
  onTurnStart: () => void
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
   * Move an entity to the specified location.
   */
  moveTo: (x: number, y: number) => void
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
