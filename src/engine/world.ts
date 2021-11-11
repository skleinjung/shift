import { map as mapI } from 'lodash'
import { filter, find, findIndex, forEach, get, initial, join, last, map, omit, values } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { getResultMessage } from './actions/result-handler'
import { AttackResult } from './combat'
import { Creature } from './creature'
import { createDungeon } from './dungeon/create-dungeon-v1'
import { Dungeon } from './dungeon/dungeon'
import { WorldEvents } from './events'
import { ExpeditionMap } from './map'
import { Player } from './player'

const TURNS_PER_SECOND = 15

/**
 * Calling 'start' will cause the game to process turns at the rate of TURNS_PER_SECOND. If, during
 * their turn, the Player actor returns an undefined action, then turn execution will halt. The player
 * will be checked periodically, and once they provide an action the loop will resume.
 */
export class World extends TypedEventEmitter<WorldEvents> {
  public readonly dungeon: Dungeon
  public readonly map = new ExpeditionMap()

  // all the world's creatures
  private _creatures: Creature[] = []

  // all player-readable log messages from this game
  private _messages: string[] = []

  // the creature whose turn is next
  private _nextActor = 0

  // data used to control the timer loop
  private _previousTurnTime = 0
  private _running = false

  private _player: Player

  constructor () {
    super()

    this._player = new Player()
    this._initializePlayer()

    const dungeon = createDungeon()
    dungeon.createTerrain(this.map)
    forEach((creature) => {
      this._registerCreature(creature)
    }, dungeon.creatures)

    forEach((treasure) => {
      this.map.getCell(treasure.x, treasure.y).addItem(treasure.item)
    }, dungeon.treasure)

    this.dungeon = dungeon

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
    return find((creature) => creature.id === id, this._creatures)
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
    return this._player
  }

  public start () {
    if (!this._running) {
      this._previousTurnTime = 0
      this._running = true
      window.requestAnimationFrame(this._onTimer.bind(this))
    }
  }

  public stop () {
    this._running = false
  }

  private _initializePlayer () {
    this._registerCreature(this._player)

    this._player.on('move', (x, y) => {
      const itemNames = map(get('name'), this.map.getItems(x, y))
      if (itemNames.length > 2) {
        // list of three or more, so use commas with 'and'
        const listContents = [...initial(itemNames), `and ${last(itemNames)}`]
        this.logMessage(`You see some items here: ${join(', ', listContents)}.`)
      } else if (itemNames.length === 2) {
        // two items, just put 'and' between them
        this.logMessage(`You see ${itemNames[0]} and ${itemNames[1]} here.`)
      } else if (itemNames.length === 1) {
        this.logMessage(`You see a ${itemNames[0]} here.`)
      }
    })
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

  /**
   * Registers a newly created creature with the world. This includes adding it to the creature list,
   * adding to the map, and registering any event listeners.
   */
  private _registerCreature (creature: Creature) {
    if (creature.type.id !== 'player' && this.map.getCreature(creature.x, creature.y) !== undefined) {
      // if the cell is occupied, skip placing the creature unless it is the player
      // this represents an error in the dungeon generator...
      return
    }

    this.map.setCreature(creature.x, creature.y, creature)
    this._creatures.push(creature)

    creature.on('attack', this._logAttack.bind(this))
  }

  private _removeDeadCreatures () {
    const deadCreatures = filter((creature) => creature.dead, values(this._creatures))
    if (deadCreatures.length > 0) {
      // remove any dead creatures
      forEach((creature) => {
        this._removeCreature(creature)
        this.logMessage(`${creature.type.name} is dead!`)

        // drop the creatures inventory
        forEach((item) => {
          this.map.getCell(creature.x, creature.y).addItem(item)
        }, creature.inventory.items)
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

    this._nextActor = (this._nextActor + 1) % this._creatures.length
    return true
  }

  private _turn () {
    // flag that indicates we are waiting, and nothing has happened. Used to avoid sending spurious 'update' events
    let stillWaiting = true
    let exit = true

    do {
      exit = !this._turnStep()

      if (!exit) {
        // we had at least one turn, clear 'stillWaiting'
        stillWaiting = false
      }
    } while (!exit && this._nextActor !== 0)

    // emit a final update at the end of the turn if we aren't waiting
    if (!stillWaiting) {
      this.emit('update')
    }
  }

  private _onTimer (timestamp: number) {
    const msPerTurn = 1000 / TURNS_PER_SECOND

    if ((timestamp - this._previousTurnTime) > msPerTurn) {
      this._turn()
      this._previousTurnTime = timestamp
    }

    if (this._running) {
      window.requestAnimationFrame(this._onTimer.bind(this))
    }
  }
}
