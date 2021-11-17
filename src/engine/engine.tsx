import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { World } from 'engine/world'
import { stubTrue } from 'lodash'
import { forEach, upperFirst } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { initializePlayer } from '../game-content/scripts/creatures/player'

import { Creature } from './creature'
import { CreatureTypeId, CreatureTypes } from './creature-db'
import { CreatureEventNames, CreatureEvents } from './events/creature-events'
import { EventManager, EventManagerEvents } from './events/event-manager'
import { EventHandlerName } from './events/types'
import { Item } from './item'
import { MapCell, MapTile } from './map/map'
import { random } from './random'
import { ScriptApi, Speech } from './script-api'

class GameController implements ScriptApi {
  constructor (
    private _engine: Engine,
    private _world: World,
    private _eventManager = new EventManager()
  ) {
    this._eventManager.on('registerCreature', this._handleCreatureEventRegistration.bind(this))
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

  public showMessage (message: string): void {
    this._engine.world.logMessage(message)
  }

  public showSpeech (speech: Speech[]): void {
    this._engine.emit('speech', speech)
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
  private _handleTurnBinding = this._handleTurn.bind(this)

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

    // initialize the campaign
    forEach((script) => {
      script.initialize?.(this._scriptApi)
    }, this._campaign.scripts)

    // initialize the player
    initializePlayer.initialize?.(this._scriptApi)
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
    this._world.on('turn', this._handleTurnBinding)
  }

  /** the engine never sleeps */
  public get paused () {
    return false
  }

  public update () {
    // noop
  }

  /** detaches the current world in preparation for a new one */
  private _detach () {
    if (this._world !== undefined) {
      this._timer.removeUpdateable(this._world)
      this._objectiveTracker.detach()
    }
  }

  private _handleTurn () {
    forEach((script) => {
      script.onTurn?.(this._scriptApi)
    }, this._campaign.scripts)
  }
}
