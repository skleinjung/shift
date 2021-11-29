import { find, findIndex } from 'lodash/fp'

import { Container } from './container'
import { CreatureAttributeModifiers } from './creature'
import { get } from './item-interaction'
import { drop, equip, unequip } from './item-inventory-action'
import { newId } from './new-id'
import { Entity } from './types'

export const EquipmentSlots = [
  'Body', // and legs, and arms.. i.e. armor
  'Feet',
  'Finger',
  'Hands', // i.e. gloves, not weapons
  'Head',
  'MainHand',
  'Neck',
  'OffHand',
  'Waist',
] as const
export type EquipmentSlot = (typeof EquipmentSlots)[number]

export type EquipmentSet = Partial<Record<EquipmentSlot, Item>>

export interface EquipmentEffects {
  attributeModifiers?: CreatureAttributeModifiers
}

export interface ItemOptions {
  /** optional detailed description for the item */
  description?: string

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

  /** the container that holds this item, if any */
  public container: Container | undefined

  /** detailed description */
  public readonly description: string | undefined

  public droppable = true

  /** the slots in which this item can be equipped, which may be an empty list */
  public readonly equipmentSlots: EquipmentSlot[]

  /** the effects of wearing this equipment, which may be undefined */
  public readonly equipmentEffects: EquipmentEffects | undefined

  /** name of this item */
  public readonly name: string

  constructor ({
    equipment,
    name,
    description,
  }: ItemOptions) {
    this.equipmentSlots = equipment?.slots ?? []
    this.equipmentEffects = equipment?.effects
    this.description = description
    this.name = name
  }

  /** ItemInteractions that apply to this item */
  public get interactions () {
    return [get]
  }

  /** gets a specific item interaction by name, or undefined if there is none */
  public getInteraction (name: string) {
    return find((availableInteraction) => availableInteraction.name === name, this.interactions)
  }

  /** ItemInventoryActions that apply to this item */
  public get inventoryActions () {
    const actions = []

    if (this.equipmentSlots.length > 0) {
      actions.push(equip, unequip)
    }

    if (this.droppable) {
      actions.push(drop)
    }

    return actions
  }

  /** gets a specific inventory action by name, or undefined if there is none */
  public getInventoryAction (name: string) {
    return find((availableAction) => availableAction.name === name, this.inventoryActions)
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
        attributeModifiers: {
          modifyMelee: (value) => value + meleeBonus,
        },
      },
      slots: ['MainHand', 'OffHand'],
    },
    name,
  })

/** Creates an item with default options for armo. */
export const createArmor = (name: string, defenseBonus = 0, description?: string) =>
  new Item({
    description,
    equipment: {
      effects: {
        attributeModifiers: {
          modifyDefense: (value) => value + defenseBonus,
        },
      },
      slots: ['Body'],
    },
    name,
  })
