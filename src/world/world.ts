import { CreatureType, CreatureTypes, PlayerCreatureTypeId } from 'db/creatures'

import { createPrototypeTerrain } from './create-prototype-terrain'
import { Creature } from './creature'
import { ExpeditionMap } from './map'

export class World {
  public readonly map = new ExpeditionMap()
  public readonly creatures: Record<number, Creature> = {}

  private _nextCreatureId = 0
  private _player: Creature

  constructor () {
    createPrototypeTerrain(this.map)
    this._player = this.spawn(CreatureTypes[PlayerCreatureTypeId], 0, 0)
  }

  /**
   * Gets the creature with a specified ID. If there is no creature with that ID, will return undefined.
   */
  public getCreature (id: number) {
    return this.creatures[id]
  }

  /**
   * Creates a creature of a given type at a specific map location.
   */
  public spawn (type: CreatureType, xLocation: number, yLocation: number) {
    const creature = new Creature(this._nextCreatureId++, type, xLocation, yLocation, this.map)
    this.creatures[creature.id] = creature
    return creature
  }

  public get player () {
    return this._player
  }
}
