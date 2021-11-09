import { reduce as reduceI } from 'lodash'
import { castArray, keys, map, reduce } from 'lodash/fp'

import { CreatureAttributeModifierMethodName, CreatureAttributeModifiers } from './creature'
import { EquipmentData } from './data/equipment'
import { EquipmentSlot, Item } from './item'

/** Interface for an object that is able to create items from a shared template */
export interface ItemTemplate {
  /** create a new item using this template */
  create: () => Item

  /** the ID of this template */
  id: string
}

const createSimpleEffects = (
  modifiers: { [k in CreatureAttributeModifierMethodName]?: number }
): CreatureAttributeModifiers => {
  const result = reduceI(
    modifiers,
    (result, modifierValue, methodName) => ({
      ...result,
      [methodName]: (value: number) => {
        return value + (modifierValue ?? 0)
      },
    }),
    {}
  )
  return result
}

/** create a template for equipment using a simplified format */
export const createEquipmentTemplate = <TId extends string>({
  id,
  name,
  description,
  slots,
  modifiers,
}: CreateEquipmentOptions<TId>): ItemTemplate & { id: TId } => ({
  create: () => new Item({
    description,
    equipment: {
      effects: {
        attributeModifiers: createSimpleEffects(modifiers ?? {}),
      },
      slots: [...castArray(slots)],
    },
    name,
  }),
  id,
})

export interface CreateEquipmentOptions<TId extends string = string> {
  /** optional detailed description for the item */
  description?: string

  /** unique id for the template */
  id: TId

  /** set of attribute modifier method names, and a static numeric bonus that should be applied by that method */
  modifiers?: { [k in CreatureAttributeModifierMethodName]?: number }

  /** human-readable name of the item */
  name: string

  /** the slots in which this item can be equipped */
  slots: Readonly<EquipmentSlot[]> | EquipmentSlot
}

const itemTemplateArray = map((data) => createEquipmentTemplate(data), EquipmentData)

export const ItemTemplates = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, itemTemplateArray) as Record<typeof itemTemplateArray[number]['id'], ItemTemplate>

export type ItemTemplateId = keyof typeof ItemTemplates
export const ItemTemplateIds = keys(ItemTemplates) as ItemTemplateId[]
