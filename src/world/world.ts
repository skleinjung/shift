import { CreatureTypes } from 'db/creatures'
import { map as mapI } from 'lodash'
import { filter, forEach, join, omit, values } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { Action, NoopAction } from './actions'
import { AttackResult } from './combat'
import { createPrototypeTerrain } from './create-prototype-terrain'
import { Creature } from './creature'
import { WorldEvents } from './events'
import { ExpeditionMap } from './map'

export class World extends TypedEventEmitter<WorldEvents> {
  public readonly map = new ExpeditionMap()
  public readonly creatures: Record<number, Creature> = {}

  // all player-readable log messages from this game
  private _messages: string[] = []

  private _nextCreatureId = 0
  private _player: Creature
  private _playerAction: Action

  constructor () {
    super()

    createPrototypeTerrain(this.map)
    this._player = this.spawn('player', 0, 0)
    this._playerAction = NoopAction

    this.spawn('kobold', -20, 0)
    this.spawn('kobold', -22, 0)
    this.spawn('kobold', -24, 0)
    this.spawn('kobold', -22, -2)
    this.spawn('kobold', -22, 2)
    this.spawn('goblin', 13, 12)
    this.spawn('orc', -30, -3)

    this.logMessage('Expedition started.')
  }

  /**
   * Appends a message to the player's log.
   */
  public logMessage (message: string) {
    this._messages.push(message)
    this.emit('message', message)
  }

  /**
   * Gets the creature with a specified ID. If there is no creature with that ID, will return undefined.
   */
  public getCreature (id: number) {
    return this.creatures[id]
  }

  /**
   * Submit the player's next action, and update the world state for the next turn.
   */
  public nextTurn (playerAction: Action) {
    this._playerAction = playerAction

    // iterate over each creature, and execute the action determined by its behavior
    forEach((creature) => {
      creature.type.behavior(creature, this)?.(creature, this)
    }, this.creatures)

    // remove any dead creatures
    const deadCreatures = filter((creature) => creature.dead, values(this.creatures))
    forEach((creature) => {
      delete this.creatures[creature.id]
      this.logMessage(`${creature.type.name} is dead!`)
      this.map.removeCreature(creature)
    }, deadCreatures)
  }

  /**
   * Creates a creature of a given type at a specific map location.
   */
  public spawn (creatureTypeId: string, xLocation: number, yLocation: number) {
    const type = CreatureTypes[creatureTypeId]
    const creature = new Creature(this._nextCreatureId++, type, xLocation, yLocation, this.map)
    this.creatures[creature.id] = creature

    creature.on('attack', this._logAttack.bind(this))

    return creature
  }

  /**
   * Gets all messages generated by this world so far.
   */
  public get messages () {
    return this._messages
  }

  public get player () {
    return this._player
  }

  /** Gets the action being performed by the player in the current turn. */
  public get playerAction () {
    return this._playerAction
  }

  /** Adds the results of an attack to the message log. */
  private _logAttack (attack: AttackResult) {
    if (attack.success) {
      // we don't display 'overkill' or 'taken' damage broken out for the user
      const damages = mapI(omit(['overkill', 'taken'], attack.damage), (value, type) => `${value} ${type}`)
      const damagesString = damages.length === 0
        ? ''
        : ` (${join(', ', damages)})`

      this.logMessage(
        `${attack.attacker.name} hits ${attack.target.name} for ${attack.damageRolled} damage.${damagesString}`
      )
    } else {
      this.logMessage(`${attack.attacker.name} misses ${attack.target.name}.`)
    }
  }
}
