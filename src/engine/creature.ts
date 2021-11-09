import { compact, find, findIndex, flow, forEach, keys, map, reduce, values } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import {
  Attack,
  Attackable,
  AttackResult,
  DamageApplication,
  Defense,
  getCombatRollResult,
  PendingAttack,
} from './combat'
import { BasicContainer } from './container'
import { CreatureType } from './creature-db'
import { CreatureEvents } from './events'
import { EquipmentSet, EquipmentSlot, Item } from './item'
import { ExpeditionMap } from './map'
import { newId } from './new-id'
import { Actor, Combatant, Damageable, EventSource, Moveable } from './types'
import { World } from './world'

/** Set of names for all numeric attributes of a Creature. */
export const CreatureAttributes = [
  'defense',
  'health',
  'healthMax',
  'melee',
] as const

/** Union type equal to the names of all numeric creature attributes. */
export type CreatureAttributeName = (typeof CreatureAttributes)[number]

export type CreatureAttributeModifierMethodName = `modify${Capitalize<CreatureAttributeName>}`

/** Object type that has a numeric value for all CreatureAttributes. Implemented by Creature. */
export type CreatureAttributeSet = { [k in CreatureAttributeName]: number }

/**
 * Type that defines an optional 'attribute modifier' method for every numeric attribute that a Creature
 * has. An 'attribute modifier' method is a method that takes a base value for an attribute and the
 * creature being modified, and returns a new value for the modifier. This is used by equipment and
 * status effects to modify the attributes of a creature.
 *
 * @param value original value of the attribute
 * @param creature creature being affected, in case its properties affect the modification
 * @return new attribute value, or the original value if it should not be changed
 */
export type CreatureAttributeModifiers = {
  [k in CreatureAttributeModifierMethodName]?: (value: number, creature: Creature) => number
}

/** Specialized container type repsenting a creature's inventory */
export class Inventory extends BasicContainer {}

/**
 * A Creature is an Actor subtype that specifically represents a living being.
 */
export class Creature extends TypedEventEmitter<CreatureEvents> implements
  Actor,
  Combatant,
  CreatureAttributeSet,
  Damageable,
  Moveable,
  EventSource<CreatureEvents> {
  private _health: number
  private _id = newId()
  private _equipment: EquipmentSet = {}

  /** inventory of items held by this creature */
  public readonly inventory: Inventory

  constructor (
    private _type: CreatureType,
    private _x: number,
    private _y: number,
    private _map: ExpeditionMap
  ) {
    super()

    if (this._map.getCreature(this._x, this._y) !== undefined) {
      throw new Error('TODO: do not fail when adding creature to occupied cell')
    }

    this._health = this._type.healthMax
    this.inventory = new Inventory()
    this._map.setCreature(this._x, this._y, this)

    const loot = this._type.lootTable?.collect() ?? []
    forEach((itemTemplate) => {
      this.inventory.addItem(itemTemplate.create())
    }, loot)
  }

  public get type () {
    return this._type
  }

  /// ////////////////////////////////////////////
  // CreatureAttributeSet

  /** the creatures total defense stat, with modifiers */
  public get defense () {
    return this._getModifiedAttribute(this._type.defense, 'modifyDefense')
  }

  /** creature's current health */
  public get health () {
    return this._getModifiedAttribute(this._health, 'modifyHealth')
  }

  public get healthMax () {
    return this._getModifiedAttribute(this._type.healthMax, 'modifyHealthMax')
  }

  /** the creatures total melee stat, with modifiers */
  public get melee () {
    return this._getModifiedAttribute(this._type.melee, 'modifyMelee')
  }

  /// ////////////////////////////////////////////
  // Equipment

  public get equipment (): Readonly<EquipmentSet> {
    return this._equipment
  }

  /** Returns whether or not a specified item is equipped. */
  public isEquipped (item: Item): boolean {
    return findIndex((equippedItem) => item.id === equippedItem?.id, values(this._equipment)) !== -1
  }

  /**
   * Equips an item in the specified slot. If no slot is given, then the default slot (main hand,
   * ring 1, etc.) will be used by default.
   *
   * Returns true if the item was successfully equipped, or false if it could not be for some
   * reason.
   **/
  public equip (item: Item, slot?: EquipmentSlot) {
    // can only equip from inventory
    if (!this.inventory.containsItem(item)) {
      return false
    }

    // cannot equip to an invalid slot
    if (slot !== undefined && !item.equippableIn(slot)) {
      return false
    }

    // if no slot specified, try to find a default
    const slotOrDefault = slot ?? find((possibleSlot) => {
      return this._equipment[possibleSlot] === undefined
    }, item.equipmentSlots)

    // no default slot available
    if (slotOrDefault === undefined) {
      return false
    }

    // item already in this slot
    if (this._equipment[slotOrDefault] !== undefined) {
      return false
    }

    this._equipment[slotOrDefault] = item
    return true
  }

  /**
   * Unequips the item at the specified slot. Returns true if the item was successfully unequipped,
   * or false if it could not be for some reason (i.e. no item at that slot, item is cursed, etc.).
   **/
  public unequip (item: Item) {
    const allSlots = keys(this._equipment) as (keyof EquipmentSet)[]
    const slot = find((slot) => this._equipment[slot] === item, allSlots)

    if (slot !== undefined) {
      delete this._equipment[slot]
      return true
    }

    return false
  }

  /// ////////////////////////////////////////////
  // Entity

  public get id () {
    return this._id
  }

  /** name of this creature */
  public get name () {
    return this._type.name
  }

  /// ////////////////////////////////////////////
  // Actor

  public getAction (world: World) {
    return this._type.behavior(this, world)
  }

  public turnEnded (_world: World) {
    // do nothing by default
  }

  /// ////////////////////////////////////////////
  // Combatant (Attacker)

  public generateAttack (_target: Attackable): Attack {
    return {
      roll: getCombatRollResult(this.melee),
    }
  }

  public onAttackComplete (result: AttackResult) {
    this.emit('attack', result, this)
  }

  /// ////////////////////////////////////////////
  // Combatant (Attackable)

  public generateDefense (_attack: Attack): Defense {
    return {
      immune: false,
      roll: getCombatRollResult(this.defense),
    }
  }

  public onHit (attack: PendingAttack): DamageApplication | null {
    const oldHealth = this.health
    this.onDamage(attack.damageRolled)
    const taken = Math.max(0, oldHealth - this.health)
    const overkill = attack.damageRolled - taken

    return overkill > 0 ? {
      taken,
      overkill,
    } : {
      taken,
    }
  }

  /// ////////////////////////////////////////////
  // Damageable

  /** flag indicating if this creature is dead or not */
  public get dead () {
    return this._health < 1
  }

  // health: See CreatureAttributeSet methods, above

  /**
   * Assign a specified amount of damage to this creature.
   */
  public onDamage (amount: number) {
    this._health = Math.max(0, this._health - amount)

    if (this._health < 1) {
      this.emit('death', this)
    }
  }

  /// ////////////////////////////////////////////
  // Moveable

  /** creature's x position on the map */
  public get x () {
    return this._x
  }

  /** creature's y position on the map */
  public get y () {
    return this._y
  }

  /**
   * Moves a creature the specified distance in each axis. If the move is impossible, will return false.
   * If the move is completed, then true is returned.
   */
  public moveBy (x: number, y: number) {
    const newX = this._x + x
    const newY = this._y + y

    if (!this._map.isTraversable(newX, newY)) {
      return false
    }

    if (this._map.getCreature(this._x, this._y) === this) {
      this._map.setCreature(this._x, this._y, undefined)
    }

    this._x = newX
    this._y = newY

    this._map.setCreature(this._x, this._y, this)
    return true
  }

  private _getModifiedAttribute (baseValue: number, modifierName: CreatureAttributeModifierMethodName) {
    const getAttributeModifiers = (equippedItem: Item) => equippedItem.equipmentEffects?.attributeModifiers

    const modifierSets = flow(
      map(getAttributeModifiers),
      compact
    )(values(this.equipment))

    return reduce(
      (result, modifierSet) => {
        const modifier = modifierSet[modifierName]
        return modifier === undefined ? result : modifier(result, this)
      },
      baseValue,
      modifierSets
    )
  }
}
