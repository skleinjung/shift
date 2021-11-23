import { map as mapI } from 'lodash'
import { filter, find, findIndex, forEach, join, omit, values } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { getResultMessage } from './actions/result-handler'
import { Creature } from './creature'
import { Dungeon } from './dungeon/dungeon'
import { CreatureEvents } from './events/creature'
import { Empty } from './events/types'
import { WorldEvents } from './events/world'
import { Item } from './item'
import { ExpeditionMap } from './map/map'
import { Player } from './player'
import { random } from './random'
import { Updateable } from './types'

/**
 * Calling 'start' will cause the game to process turns at the rate of TURNS_PER_SECOND. If, during
 * their turn, the Player actor returns an undefined action, then turn execution will halt. The player
 * will be checked periodically, and once they provide an action the loop will resume.
 */
export class World extends TypedEventEmitter<WorldEvents> implements Updateable {
  private _dungeon: Dungeon | undefined
  private _map = new ExpeditionMap()

  // if true, we do not process updates (the user has requested we wait)
  public paused = false

  // another entity has asked us to wait until the specified timestamp (to run animations, for example)
  private _deferUntil: number | undefined

  // all the world's creatures
  private _creatures: Creature[] = []

  // all the world's items
  private _items: { [k in Item['id']]?: Item } = {}

  // all player-readable log messages from this game
  private _messages: string[] = []

  // the creature whose turn is next
  private _nextActor = 0

  private _player?: Player

  constructor () {
    super()
    this.logMessage('Expedition started.')
  }

  public initializeFromDungeon (dungeon: Dungeon) {
    this._dungeon = dungeon
    this._map = dungeon.createMap()

    this._dungeon.forEachCreature(this._registerCreature.bind(this))
    this._dungeon.forEachItem(this.addItemToMap.bind(this))
  }

  /**
   * Appends a message to the player's log.
   */
  public logMessage (message: string) {
    this._messages.push(message)
  }

  public get dungeon () {
    return this._dungeon
  }

  public get map () {
    return this._map
  }

  public get creatures (): readonly Creature[] {
    return this._creatures
  }

  /** Adds a new creature to the world. It will emit any 'on-spawn' type of events. */
  public addCreature (creature: Creature) {
    this._registerCreature(creature)
  }

  /** Removes a creature from the map and world world. It will not emit a 'death' event. */
  public removeCreature (creature: Creature) {
    this._removeCreature(creature)
  }

  /**
   * Gets the creature with a specified ID. If there is no creature with that ID, will return undefined.
   */
  public getCreature (id: number) {
    return find((creature) => creature.id === id, this._creatures)
  }

  /** Adds a new item to the world, placing it in the specified map cell. */
  public addItemToMap (item: Item, x: number, y: number) {
    this._registerItem(item)
    this._map.addItem(x, y, item)
  }

  /** Removes an item from the world, including any container or map cell holding it */
  public removeItem ({ id }: Item) {
    const item = this._items[id]
    if (item !== undefined) {
      item.container?.removeItem(item)
      delete this._items[item.id]
    }
  }

  /**
   * Gets the item with a specified ID. If there is no item with that ID, will return undefined.
   */
  public getItem (id: number) {
    return this._items[id]
  }

  /** Returns flag indicating if the current expedition reached an end condition. */
  public get expeditionEnded () {
    return this.player.link < 1 || this.player.dead
  }

  /**
   * Gets all messages generated by this world so far.
   */
  public get messages () {
    return this._messages
  }

  public get player () {
    if (this._player === undefined) {
      throw new Error('The player is undefined.')
    }

    return this._player
  }

  /** Do not process updates until at least the specified in in ms has passed. */
  public defer (timeInMs: number) {
    const requestedTimestamp = Date.now() + timeInMs
    if (this._deferUntil === undefined || requestedTimestamp > this._deferUntil) {
      this._deferUntil = requestedTimestamp
    }
  }

  public update () {
    if (this.paused) {
      return
    }

    // flag that indicates we are waiting, and nothing has happened. Used to avoid sending spurious 'update' events
    let stillWaiting = true
    let exit = true

    do {
      // check if we are waiting for visual effects
      if (this._deferUntil !== undefined && Date.now() < this._deferUntil) {
        break
      } else {
        this._deferUntil = undefined
      }

      exit = !this._turnStep()

      if (!exit) {
        // we had at least one turn, clear 'stillWaiting'
        stillWaiting = false
      }
    } while (!exit && this._nextActor !== 0)

    if (!stillWaiting) {
      // if the next actor's index is zero, we looped through all creatures -- emit a turn event
      if (this._nextActor === 0) {
        this.emit('turn', Empty)
      }

      // emit a final update at the end of the loop if we aren't waiting
      this.emit('update', Empty)
    }
  }

  /** Adds the results of an attack to the message log. */
  private _logAttack ({ attackResult }: CreatureEvents['attack']) {
    if (attackResult.success) {
      // we don't display 'overkill' or 'taken' damage broken out for the user
      const damages = mapI(omit(['overkill', 'taken'], attackResult.damage), (value, type) => `${value} ${type}`)
      const damagesString = damages.length === 0
        ? ''
        : ` (${join(', ', damages)})`

      this.logMessage(
        // eslint-disable-next-line max-len
        `${attackResult.attacker.name} hits ${attackResult.target.name} for ${attackResult.damageRolled} damage.${damagesString}`
      )
    } else {
      this.logMessage(`${attackResult.attacker.name} misses ${attackResult.target.name}.`)
    }
  }

  /**
   * Registers a newly created creature with the world. This includes adding it to the creature list,
   * and registering any event listeners.
   */
  private _registerCreature (creature: Creature) {
    this._creatures.push(creature)

    if (creature instanceof Player) {
      this._player = creature
    }

    creature.on('attack', this._logAttack.bind(this))
    this.map.setCreature(creature.x, creature.y, creature)
  }

  /**
   * Registers a newly created item with the world. This includes adding it to the item list,
   * and registering any event listeners.
   */
  private _registerItem (item: Item) {
    this._items[item.id] = item
  }

  private _removeDeadCreatures () {
    const deadCreatures = filter((creature) => creature.dead, values(this._creatures))
    if (deadCreatures.length > 0) {
      // remove any dead creatures
      forEach((creature) => {
        this._removeCreature(creature)
        this.logMessage(`${creature.type.name} is dead!`)

        // drop the creatures inventory
        // we clone the inventory item array, since moving items out of it will mess up iteration
        forEach((item) => {
          this.map.getCell(creature.x, creature.y).addItem(item)
        }, [...creature.inventory.items])
      }, deadCreatures)
    }
  }

  /** Removes a creature from the map and actor list */
  private _removeCreature (creature: Creature) {
    const index = findIndex((candidate) => candidate.id === creature.id, this._creatures)

    // we track next actor by index, so we need to move the index back after deleting an actor
    if (this._nextActor > index) {
      this._nextActor--
    }

    if (index > -1) {
      this._creatures.splice(index, 1)
    }

    this.map.removeCreature(creature)
  }

  /**
   * Execute the action for the next actor in the list. Will return true if the actor was processed
   * successfully, or false if we need to wait for additional input.
   */
  private _turnStep (): boolean {
    if (this._creatures.length === 0) {
      return true
    }

    const creature = this._creatures[this._nextActor]

    // loop until initiative is exhausted
    while (creature.initiative > 0 && random(0, 99) < creature.initiative) {
      const action = creature?.behavior?.(creature, this)
      if (action === undefined && creature.id === this.player.id) {
        // if it's the player's turn and there is no action, return and wait for the UI to supply one
        return false
      }

      if (creature !== undefined && action !== undefined) {
        // TODO: examine success/failure return value
        const result = action.execute(this)

        const message = getResultMessage(result)
        if (message !== undefined) {
          this.logMessage(message)
        }

        this._removeDeadCreatures()
      }

      // deduect initiative for the action
      // TODO: think through 'undefined' results from monsters
      creature.initiative -= 100
    }

    creature.onTurnEnd()
    this._nextActor = (this._nextActor + 1) % this._creatures.length
    this._creatures[this._nextActor].onTurnStart()

    // update initaitive for this turn (we add it _after_ decrementing to
    // more easily handle the 'waiting for input' case)
    creature.initiative += creature.speed

    return true
  }
}
