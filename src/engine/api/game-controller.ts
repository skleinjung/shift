import { Campaign, DemoCampaign } from 'engine/campaign'
import { Creature } from 'engine/creature'
import { CreatureTypeId, CreatureTypes } from 'engine/creature-db'
import { Engine } from 'engine/engine'
import { CreatureEventNames, CreatureEvents } from 'engine/events/creature'
import { EventManager, EventManagerEvents } from 'engine/events/event-manager'
import { GameEventEmitter } from 'engine/events/game'
import { EventHandlerName } from 'engine/events/types'
import { Item } from 'engine/item'
import { MapCell, MapTile } from 'engine/map/map'
import { TerrainTypeId, TerrainTypes } from 'engine/terrain-db'
import { World } from 'engine/world'
import { forEach, random, stubTrue, upperFirst } from 'lodash/fp'

import { ScriptApi } from './script-api'
import { Speech, UiController } from './ui-api'

export class GameController extends GameEventEmitter implements ScriptApi {
  private _engine: Engine
  private _eventManager: EventManager
  private _world: World
  private _campaign: Campaign

  constructor (
    private _ui: UiController
  ) {
    super()

    this._eventManager = new EventManager()
    this._eventManager.on('registerCreature', this._handleCreatureEventRegistration.bind(this))

    this._campaign = new DemoCampaign()
    this._engine = new Engine(this._campaign, this)
    this._world = this._engine.world
    this._engine.onInitialize()

    this._ui.on('ready', () => {
      this._engine.onUiReady()
    })
  }

  /** Gets the active campaign */
  public get campaign () {
    return this._campaign
  }

  /** Gets the game engine */
  public get engine () {
    return this._engine
  }

  public get ui () {
    return this._ui
  }

  /** @deprecated access to the world is being dropped soon */
  public get world () {
    return this._world
  }

  public get creatures (): readonly Creature[] {
    return this._world.creatures
  }

  public get player (): Creature {
    return this._world.player
  }

  /** Adds a new creature to the world. It will emit any 'on-spawn' type of events. */
  public addCreature (creatureOrType: Creature | CreatureTypeId, x = 0, y = 0): number {
    const creature = creatureOrType instanceof Creature
      ? creatureOrType
      : new Creature(CreatureTypes[creatureOrType], x, y)

    this._eventManager.registerCreature(creature, creature)
    this._world.addCreature(creature)
    creature.emit('create', { creature })

    return creature.id
  }

  public getRandomLocation (filter: (tile: MapTile) => boolean = stubTrue): MapTile | undefined {
    const matchingCells = this._world.map.getCells(filter)
    return matchingCells.length === 0
      ? undefined
      : matchingCells[random(0, matchingCells.length - 1)]
  }

  /** todo: lots of duplication with MoveToAction */
  public moveCreature (id: number, x: number, y: number): void {
    const creature = this._world.getCreature(id)
    if (creature === undefined) {
      throw new Error(`Cannot move creature with id "${id}: the creature was not found`)
    }

    if (this._world.map.getCreature(x, y) !== undefined) {
      throw new Error(`Cannot move creature to (${x}, ${y}): the cell is occupied`)
    }

    const oldX = creature.x
    const oldY = creature.y

    // check if we can move there
    if (!this._world.map.isTraversable(x, y)) {
      throw new Error(`Cannot move creature to (${x}, ${y}): the cell is not traversable`)
    }

    // remove entity from old cell
    if (this._world.map.getCreature(oldX, oldY) === creature) {
      this._world.map.setCreature(oldX, oldY, undefined)
    }

    // place creature in new cell
    this._world.map.setCreature(x, y, creature)

    creature.moveTo(x, y)
  }

  public removeCreature (id: number): void {
    const creature = this._world.getCreature(id)
    if (creature !== undefined) {
      this._world.removeCreature(creature)
      this._eventManager.unregisterCreature(creature.id)
    }
  }

  public getMapTile (x: number, y: number): MapTile | undefined {
    return this._world.map.getMapTile(x, y)
  }

  public setTileDescription (x: number, y: number, description: string): void {
    this._world.map.getCell(x, y).customDescription = description
  }

  public setTerrain (x: number, y: number, terrain: TerrainTypeId): void {
    this._world.map.setTerrain(x, y, TerrainTypes[terrain])
  }

  public addMapItem (item: Item, x: number, y: number): number {
    this._world.addItemToMap(item, x, y)
    return item.id
  }

  public moveMapItem (id: number, x: number, y: number): void {
    const item = this._world.getItem(id)
    if (item === undefined) {
      throw new Error(`Cannot move item with id "${id}: the item was not found`)
    }

    if (item?.container !== undefined && !(item.container instanceof MapCell)) {
      throw new Error(`Cannot move map item with id ${id}: it is in a container, and not in a map cell`)
    }

    this._world.map.addItem(x, y, item)
  }

  public removeMapItem (id: number): void {
    const item = this._world.getItem(id)
    if (item !== undefined) {
      if (item?.container !== undefined && !(item.container instanceof MapCell)) {
        throw new Error(`Cannot remove map item with id ${id}: it is in a container, and not in a map cell`)
      }

      this._world.removeItem(item)
    }
  }

  /** When a creature is registered with the event manager, register all of it's script listeners */
  private _handleCreatureEventRegistration ({ creature, eventEmitter }: EventManagerEvents['registerCreature']) {
    forEach((script) => {
      forEach((eventName) => {
        const handlerName = `on${upperFirst(eventName)}` as EventHandlerName<keyof CreatureEvents>
        const handler = script[handlerName]
        if (handler !== undefined) {
          eventEmitter.on(eventName, (event: any) => {
            handler(event, this)
          })
        }
      }, CreatureEventNames)
    }, creature.scripts)
  }

  // UI API delegation

  public showMessage (message: string): void {
    this._engine.world.logMessage(message)
  }

  public showSpeech (speech: Speech[]): Promise<void> {
    return this._ui.showSpeech(speech)
  }
}
