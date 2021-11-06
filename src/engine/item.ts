import { findIndex } from 'lodash/fp'

import { newId } from './new-id'
import { Entity } from './types'

export const EquipmentSlots = [
  'Body',
  'MainHand',
  'OffHand',
] as const
export type EquipmentSlot = (typeof EquipmentSlots)[number]

export type Equipment = Partial<Record<EquipmentSlot, Item>>

export interface ItemOptions {
  /** the slots in which this item can be equipped, which may be an empty list */
  equipmentSlots?: EquipmentSlot[]

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

  public readonly name: string

  constructor ({
    equipmentSlots = [],
    name,
  }: ItemOptions) {
    this.equipmentSlots = equipmentSlots
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

/** Creates an item with default options for a weapon. */
export const createWeapon = (name: string) =>
  new Item({ name, equipmentSlots: ['MainHand', 'OffHand'] })
