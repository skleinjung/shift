import { CreatureTypes } from 'db/creatures'
import { forEach } from 'lodash/fp'

import { Action, NoopAction } from './actions'
import { createPrototypeTerrain } from './create-prototype-terrain'
import { Creature } from './creature'
import { ExpeditionMap } from './map'

export class World {
  public readonly map = new ExpeditionMap()
  public readonly creatures: Record<number, Creature> = {}

  private _nextCreatureId = 0
  private _player: Creature
  private _playerAction: Action

  constructor () {
    createPrototypeTerrain(this.map)
    this._player = this.spawn('player', 0, 0)
    this._playerAction = NoopAction

    this.spawn('kobold', -20, 0)
    this.spawn('goblin', 13, 12)
    this.spawn('orc', -30, -3)
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
      creature.type.behavior(creature, this)(creature, this)
    }, this.creatures)
  }

  /**
   * Creates a creature of a given type at a specific map location.
   */
  public spawn (creatureTypeId: string, xLocation: number, yLocation: number) {
    const type = CreatureTypes[creatureTypeId]
    const creature = new Creature(this._nextCreatureId++, type, xLocation, yLocation, this.map)
    this.creatures[creature.id] = creature
    return creature
  }

  public get player () {
    return this._player
  }

  /** Gets the action being performed by the player in the current turn. */
  public get playerAction () {
    return this._playerAction
  }
}
