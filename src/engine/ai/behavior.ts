import { Creature } from '../creature'
import { Action } from '../types'
import { World } from '../world'

/**
 * A behavior provides a function that generates an action for a creature during each turn. If a
 * player actor's behavior returns undefined, the game state will halt updates until it returns a
 * defined value. If a non-player returns undefined, it will be skipped (it's turn treated as 'do
 * nothing').
 **/
export type Behavior = (creature: Creature, world: World) => Action | undefined

/** function that is able to create behaviors */
export type BehaviorFactory = () => Behavior
