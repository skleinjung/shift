import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { World } from 'engine/world'
import { stubTrue } from 'lodash'
import { forEach } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { Creature } from './creature'
import { CreatureTypeId, CreatureTypes } from './creature-db'
import { Item } from './item'
import { MapCell } from './map/map'
import { random } from './random'
import { MapTile, ScriptApi, Speech } from './script-api'

class GameController implements ScriptApi {
  constructor (
    private _engine: Engine,
    private _world: World
  ) { }

  /** @deprecated access to the world is being dropped soon */
  public get world () {
    return this._world
  }

  public get creatures (): readonly Creature[] {
    return this._world.creatures
  }

  /** Adds a new creature to the world. It will emit any 'on-spawn' type of events. */
  public addCreature (creatureOrType: Creature | CreatureTypeId, x = 0, y = 0): number {
    const creature = creatureOrType instanceof Creature
      ? creatureOrType
      : new Creature(CreatureTypes[creatureOrType], x, y)

    this._world.addCreature(creature)
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
    }
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

  public showSpeech (speech: Speech[]): void {
    this._engine.emit('speech', speech)
  }
}

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
  // game timer
  private _timer = new GameTimer()

  // the currently attached world
  private _world: World

  // script controller, that facilitates communicate between scripts, the UI, and the world
  private _scriptApi: ScriptApi

  /** objective tracker listens to world events, and updates campaign objectives */
  private _objectiveTracker = new ObjectiveTracker()

  // world event handlers
  private _handleCreatureSpawnBinding = this._handleCreatureSpawn.bind(this)

  constructor (
    private _campaign: Campaign
  ) {
    super()

    this._world = new World()
    this._scriptApi = new GameController(this, this._world)

    this._timer.addUpdateable(this)
    forEach((objective) => {
      this._objectiveTracker.addObjective(objective)
    }, this._campaign.objectives)

    this._objectiveTracker.on('objectiveProgress', (progress, objective) => {
      forEach((script) => {
        script.onObjectiveProgress?.(progress, objective, this._scriptApi)
      }, this._campaign.scripts)
    })

    this.attach(this._world)
    this._world.initializeFromDungeon(this._campaign.createNextDungeon())

    forEach((script) => {
      script.initialize?.(this._scriptApi)
    }, this._campaign.scripts)
  }

  public get world () {
    return this._world
  }

  public start () {
    this._timer.start()
  }

  public stop () {
    this._timer.stop()
  }

  /** attaches this objective tracker to a world */
  public attach (world: World) {
    this._detach()
    this._world = world

    this._objectiveTracker.attach(world)
    this._timer.addUpdateable(world)

    // attach our listeners
    this._world.on('creatureSpawn', this._handleCreatureSpawnBinding)
  }

  /** the engine never sleeps */
  public get paused () {
    return false
  }

  public update () {
    forEach((script) => {
      script.onUpdate?.(this._scriptApi)
    }, this._campaign.scripts)
  }

  /** detaches the current world in preparation for a new one */
  private _detach () {
    if (this._world !== undefined) {
      this._timer.removeUpdateable(this._world)
      this._objectiveTracker.detach()

      // detach our listeners
      this._world.off('creatureSpawn', this._handleCreatureSpawnBinding)
    }
  }

  private _handleCreatureSpawn (creature: Creature) {
    creature.script?.onCreate?.(this._scriptApi, creature)

    // manually forwarding all events will get cumbersome, consider automating
    creature.on('move', (creature, x, y, oldX, oldY) => {
      creature.script?.onMove?.(this._scriptApi, creature, { x, y, oldX, oldY })
    })
  }
}
