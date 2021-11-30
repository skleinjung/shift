import { DoNothing } from 'engine/actions/do-nothing'
import { Campaign } from 'engine/campaign'
import { Commands } from 'engine/commands'
import { Creature } from 'engine/creature'
import { CreatureTypeId, CreatureTypes } from 'engine/creature-db'
import { CreatureEventNames, CreatureEvents } from 'engine/events/creature'
import { EventManager, EventManagerEvents } from 'engine/events/event-manager'
import { GameEventEmitter } from 'engine/events/game'
import { EventHandlerName } from 'engine/events/types'
import { WorldEventNames, WorldEvents } from 'engine/events/world'
import { Item } from 'engine/item'
import { MapCell, MapTile } from 'engine/map/map'
import { Player } from 'engine/player'
import { TerrainTypeId, TerrainTypes } from 'engine/terrain-db'
import { World } from 'engine/world'
import { ZoneId } from 'engine/zone-db'
import { forEach, random, split, stubTrue, upperFirst } from 'lodash/fp'

import { ScriptApi } from './script-api'
import { WorldScript } from './script-interfaces'
import { MenuName, Speech, UiController } from './ui-api'

export class GameController extends GameEventEmitter implements ScriptApi {
  private _campaign: Campaign
  private _eventManager: EventManager
  private _ui: UiController
  private _world: World

  // flag used to indicate if the world has been marked as 'ready' or not
  private _worldReady = false

  constructor (
    ui: UiController,
    campaign: Campaign
  ) {
    super()

    this._campaign = campaign
    this._eventManager = new EventManager()
    this._eventManager.on('registerCreature', this._registerCreatureScripts.bind(this))

    this._ui = ui
    if (this._campaign.defaultZone === undefined) {
      throw new Error('Campaign has no default zone.')
    }

    this._world = this.loadZone(this._campaign.defaultZone)
  }

  public get campaign () {
    return this._campaign
  }

  public get ui () {
    return this._ui
  }

  public get world () {
    return this._world
  }

  /** Called when the game timer 'ticks'. */

  public update (): void {
    if (!this._worldReady) {
      if (this._ui.ready) {
        this.world.emit('ready', { world: this._world })
        this._worldReady = true
      }
    } else {
      this.world?.update()
    }
  }

  /// ////////////////////////////////////////////
  // CampaignApi

  public getTimesVisited (zoneId: ZoneId): number {
    return this._campaign.getTimesVisited(zoneId)
  }

  public hasVisited (zoneId: ZoneId): boolean {
    return this.getTimesVisited(zoneId) > 0
  }

  public loadZone (id: ZoneId): World {
    this._world?.removeAllListeners()

    this._world = new World()

    // register new zone script listeners, and remove previous ones
    this._registerZoneScripts(this._campaign.getZoneScripts(id))

    // emit initialize event for world, letting scripts proceess it
    this._worldReady = false
    this.world.emit('initialize', { world: this._world })
    this.emit('worldChange', { world: this._world })

    // TODO: hack, a race condition keeps the world from updating. forcing it to take a turn fixes this
    this.player.nextAction = DoNothing

    return this._world
  }

  /// ////////////////////////////////////////////
  // ConsoleApi

  public executeCommand (commandString: string): void {
    this.showMessage(`> ${commandString}`)

    const [commandName, ...commandArgs] = split(' ', commandString)

    const command = Commands[commandName]
    if (command !== undefined) {
      command.execute(commandArgs, this)
    } else {
      this.showMessage('Unrecognized command. (Try "help")')
    }
  }

  public showMessage (message: string): void {
    this._world.logMessage(message)
  }

  /// ////////////////////////////////////////////
  // CreatureApi

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

  public get creatures (): readonly Creature[] {
    return this._world.creatures
  }

  public get player (): Player {
    return this._world.player
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

  /// ////////////////////////////////////////////
  // MapApi

  public getMapTile (x: number, y: number): MapTile | undefined
  public getMapTile (x: number, y: number, forceCreate: true): MapTile
  public getMapTile (x: number, y: number, forceCreate?: boolean): MapTile | undefined {
    if (forceCreate) {
      return this._world.map.getMapTile(x, y, true)
    } else {
      return this._world.map.getMapTile(x, y)
    }
  }

  public addMapItem (item: Item, x: number, y: number): number {
    this._world.addItemToMap(item, x, y)
    return item.id
  }

  public getRandomLocation (filter: (tile: MapTile) => boolean = stubTrue): MapTile | undefined {
    const matchingCells = this._world.map.getCells(filter)
    return matchingCells.length === 0
      ? undefined
      : matchingCells[random(0, matchingCells.length - 1)]
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

  public setTileDescription (x: number, y: number, description: string): void {
    this._world.map.getCell(x, y).customDescription = description
  }

  public setTerrain (x: number, y: number, terrain: TerrainTypeId): void {
    this._world.map.setTerrain(x, y, TerrainTypes[terrain])
  }

  /// ////////////////////////////////////////////
  // UiApi

  public showMenu (menu: MenuName | undefined): Promise<void> {
    return this._ui.showMenu(menu)
  }

  public showSpeech (speech: Speech[]): Promise<void> {
    return this._ui.showSpeech(speech)
      .then(() => {
        forEach((speechItem) => {
          this.showMessage(`${speechItem.speaker}: "${speechItem.message}"`)
        }, speech)
      })
  }

  /// ////////////////////////////////////////////
  // Event Listener Registration

  private _registerZoneScripts (scripts: WorldScript[]) {
    // unbind previous scripts
    forEach((event) => {
      this.world.removeAllListeners(event)
    }, WorldEventNames)

    forEach((script) => {
      forEach((eventName) => {
        const handlerName = `on${upperFirst(eventName)}` as EventHandlerName<keyof WorldEvents>
        const handler = script[handlerName]

        if (handler !== undefined) {
          this.world.on(eventName, (event: any) => {
            handler({ ...event, api: this })
          })
        }
      }, WorldEventNames)
    }, scripts)
  }

  /** When a creature is registered with the event manager, register all of it's script listeners */
  private _registerCreatureScripts ({ creature, eventEmitter }: EventManagerEvents['registerCreature']) {
    forEach((script) => {
      forEach((eventName) => {
        const handlerName = `on${upperFirst(eventName)}` as EventHandlerName<keyof CreatureEvents>
        const handler = script[handlerName]
        if (handler !== undefined) {
          eventEmitter.on(eventName, (event: any) => {
            handler({ ...event, api: this })
          })
        }
      }, CreatureEventNames)
    }, creature.scripts)
  }
}
