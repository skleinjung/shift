import { map as mapI } from 'lodash'
import { compact, filter, forEach, join, map, omit, values } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { DoNothing } from './actions/do-nothing'
import { getResultMessage } from './actions/result-handler'
import { AttackResult } from './combat'
import { Creature } from './creature'
import { CreatureTypes } from './creature-db'
import { createDungeon } from './dungeon/create-dungeon-v1'
import { WorldEvents } from './events'
import { createArmor, createWeapon } from './item'
import { ExpeditionMap } from './map'
import { Player } from './player'
import { Action } from './types'

export class World extends TypedEventEmitter<WorldEvents> {
  public readonly map = new ExpeditionMap()
  public readonly creatures: Record<number, Creature> = {}

  // all player-readable log messages from this game
  private _messages: string[] = []

  private _player: Player
  private _playerAction: Action

  constructor () {
    super()

    // eslint-disable-next-line no-console
    console.log('>>>>>>>>>>>> New World')

    const dungeon = createDungeon()
    dungeon.createTerrain(this.map)
    forEach((creature) => {
      this._registerCreature(creature)
    }, dungeon.creatures)

    forEach((treasure) => {
      this.map.getCell(treasure.x, treasure.y).addItem(treasure.item)
    }, dungeon.treasure)

    this._player = new Player(CreatureTypes.player, 0, 0)
    this._registerCreature(this._player)
    this._playerAction = DoNothing
    // this._player.inventory.addItem(new Item({ name: 'a coconut' }))
    // this._player.inventory.addItem(new Item({ name: 'hopes and dreams' }))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const spear = createWeapon('+100 spear', 100)
    // this._player.inventory.addItem(spear)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const armor = createArmor('amazing, glowing armor', 100, `Lorem ipsum dolor sit amet, 
consectetur adipiscing elit. Aenean pharetra est id velit laoreet, eu semper lectus ullamcorper.
Nunc pellentesque nunc ex, eu venenatis orci mattis non. Maecenas in justo mollis, luctus urna 
porttitor, imperdiet lectus. Quisque sit amet quam venenatis, iaculis sapien in, rutrum dui.`)
    // this._player.inventory.addItem(armor)

    // this.map.addItem(-2, 0, createWeapon('+1 spear', 1))
    // this.map.addItem(2, 0, createWeapon('+2 spear', 2))
    // this.map.addItem(2, 0, createWeapon('+3 spear', 3))

    // const leather = ItemTemplates.leather_armor.create()
    // this.map.addItem(0, 2, leather)

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

    // iterate over each creature, and get the action determined by its behavior
    const actions = map((creature) => creature.type.behavior(creature, this), this.creatures)

    // once all actions have been determined, execute them
    // TODO: examine success/failure return value
    forEach((action) => {
      const result = action.execute(this)

      const message = getResultMessage(result)
      if (message !== undefined) {
        this.logMessage(message)
      }
    }, compact(actions))

    // remove any dead creatures
    const deadCreatures = filter((creature) => creature.dead, values(this.creatures))
    forEach((creature) => {
      delete this.creatures[creature.id]
      this.logMessage(`${creature.type.name} is dead!`)
      this.map.removeCreature(creature)

      // drop the creatures inventory
      forEach((item) => {
        this.map.getCell(creature.x, creature.y).addItem(item)
      }, creature.inventory.items)
    }, deadCreatures)

    this.emit('turn')
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
    this.creatures[creature.id] = creature

    creature.on('attack', this._logAttack.bind(this))
  }
}
