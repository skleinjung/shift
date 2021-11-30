import { Attack, AttackResult } from 'engine/combat'
import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { Entity } from 'engine/types'
import { enumerate } from 'enumerate'
import { TypedEventEmitter } from 'typed-event-emitter'

export type CreatureEvents = {
  /** Emitted whenever the creature performs an attack. */
  attack: {
    /** creature emitting the event */
    creature: Creature

    /** the result of the attack */
    attackResult: AttackResult
  }

  /** Emitted when the creature is created and added to the game. */
  create: {
    creature: Creature
  }

  /** Emitted when a creature is dealt damage. */
  damaged: {
    /** creature emitting the event */
    creature: Creature

    /** amount of damage taken */
    amount: number

    /** the source which dealt the damage */
    source: Entity
  }

  /** Emitted when a creature is killed */
  death: {
    /** creature emitting the event */
    creature: Creature
  }

  /** Emitted whenever the creature generates a defense against an attack. */
  defend: {
    /** creature emitting the event */
    creature: Creature

    /** attack that was defended against */
    attack: Attack
  }

  /** Emitted when a positionable's map location changes. */
  move: {
    /** creature emitting the event */
    creature: Creature

    /** x-coordinate that was moved to */
    x: number

    /** y-coordinate that was moved to */
    y: number

    /** old x-coordinate that was moved from */
    xOld: number

    /** old y-coordinate that was moved from */
    yOld: number
  }

  trade: {
    /**
     * Function that should be called if the trade is accepted. If called, the item
     * will be placed in our inventory and taken from the giver. If no handler calls this,
     * then the trade will be rejected.
     */
    accept: () => void

    creature: Creature

    /** item being given */
    item: Item

    /** creature that is attempting to give us the item */
    source: Creature
  }

  turnEnd: {
    /** emitted by a creature after each of its turns completes */
    creature: Creature
  }

  turnStart: {
    /** emitted by a creature after each of its turns begins */
    creature: Creature
  }
}

/**
 * Array of constants that can be used to iterate over all creature events in the CreatureEvents declaration.
 * The types guarantee this is an exhaustive list.
 */
export const CreatureEventNames = enumerate<keyof CreatureEvents>()(
  'attack',
  'create',
  'damaged',
  'death',
  'defend',
  'move',
  'trade',
  'turnEnd',
  'turnStart'
)

/** event emitter type for creatures */
export class CreatureEventEmitter extends TypedEventEmitter<{
  [k in keyof CreatureEvents]: (event: CreatureEvents[k]) => void
}> {}
