import { findIndex } from 'lodash/fp'

import { Creature } from './creature'
import { newId } from './new-id'
import { Entity } from './types'

export const EquipmentSlots = [
  'Body',
  'MainHand',
  'OffHand',
] as const
export type EquipmentSlot = (typeof EquipmentSlots)[number]

export type EquipmentSet = Partial<Record<EquipmentSlot, Item>>

export interface EquipmentEffects {
  /**
   * Optional method that returns a modifier to the wearer's "defense" score.
   **/
  defenseModifier?: (wearer: Creature) => number

  /**
   * Optional method that returns a modifier to the wearer's "melee" score.
   **/
  meleeModifier?: (wearer: Creature) => number
}

export interface ItemOptions {
  /** optional configuration for equippable items */
  equipment?: {
    /** the effects on the wearer when this item is equipped */
    effects?: EquipmentEffects

    /** the slots in which this item can be equipped */
    slots: EquipmentSlot[]
  }

  /** human-readable name of the item */
  name: string
}

/**
 * An Item represents a uniqueable identifiable item in the game world. This could include dungeon
 * features that are not actors, treasure on the ground, equipment carried by a creature, and so
 * on.
 */
export class Item implements Entity {
  public readonly id = newId()

  /** the slots in which this item can be equipped, which may be an empty list */
  public readonly equipmentSlots: EquipmentSlot[]

  /** the effects of wearing this equipment, which may be undefined */
  public readonly equipmentEffects: EquipmentEffects | undefined

  public readonly name: string

  constructor ({
    equipment,
    name,
  }: ItemOptions) {
    this.equipmentSlots = equipment?.slots ?? []
    this.equipmentEffects = equipment?.effects
    this.name = name
  }

  /** flag indicating if this item can be equipped or not */
  public get equippable () {
    return this.equipmentSlots.length > 0
  }

  public equippableIn (slot: EquipmentSlot) {
    return findIndex((candidate) => candidate === slot, this.equipmentSlots) !== -1
  }
}

export class Equippable extends Item {

}

/** Creates an item with default options for a weapon. */
export const createWeapon = (name: string, meleeBonus = 0) =>
  new Item({
    equipment: {
      effects: {
        meleeModifier: () => meleeBonus,
      },
      slots: ['MainHand', 'OffHand'],
    },
    name,
  })

/** Creates an item with default options for armo. */
export const createArmor = (name: string, defenseBonus = 0) =>
  new Item({
    equipment: {
      effects: {
        defenseModifier: () => defenseBonus,
      },
      slots: ['Body'],
    },
    name,
  })
