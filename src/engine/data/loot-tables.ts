import { ItemTemplates } from 'engine/item-db'
import { ProductGroup } from 'engine/spawnable'

const easyLoot = ProductGroup.rollOne(
  [
    [15, ItemTemplates.leather_armor],
    [15, ItemTemplates.leather_boots],
    [15, ItemTemplates.soft_leather_gloves],
    [15, ItemTemplates.wooden_buckler],
    [20, ItemTemplates.dagger],
    [15, ItemTemplates.spear],
    [0, ItemTemplates.glowing_spear],
    [0, ItemTemplates.ring_of_protection],
    [0, ItemTemplates.gold_circlet],
    [5, ItemTemplates.necrotic_amulet],
    [0, ItemTemplates.girdle_of_punching],
  ]
)

const mediumLoot = ProductGroup.rollOne(
  [
    [15, ItemTemplates.leather_armor],
    [5, ItemTemplates.leather_boots],
    [5, ItemTemplates.soft_leather_gloves],
    [15, ItemTemplates.wooden_buckler],
    [20, ItemTemplates.dagger],
    [15, ItemTemplates.spear],
    [5, ItemTemplates.glowing_spear],
    [5, ItemTemplates.ring_of_protection],
    [5, ItemTemplates.gold_circlet],
    [5, ItemTemplates.necrotic_amulet],
    [5, ItemTemplates.girdle_of_punching],
  ]
)

const hardLoot = ProductGroup.rollOne(
  [
    [5, ItemTemplates.leather_armor],
    [0, ItemTemplates.leather_boots],
    [0, ItemTemplates.soft_leather_gloves],
    [5, ItemTemplates.wooden_buckler],
    [5, ItemTemplates.dagger],
    [15, ItemTemplates.spear],
    [25, ItemTemplates.glowing_spear],
    [15, ItemTemplates.ring_of_protection],
    [15, ItemTemplates.gold_circlet],
    [0, ItemTemplates.necrotic_amulet],
    [15, ItemTemplates.girdle_of_punching],
  ]
)

export const MonsterLootTables = [
  ProductGroup.rollMany(
    [
      [50, easyLoot],
      [50, easyLoot],
      [50, easyLoot],
      [20, mediumLoot],
      [20, mediumLoot],
      [5, hardLoot],
    ]
  ),
  ProductGroup.rollMany(
    [
      [100, easyLoot],
      [50, easyLoot],
      [50, easyLoot],
      [50, mediumLoot],
      [50, mediumLoot],
      [25, hardLoot],
    ]
  ),
  ProductGroup.rollMany(
    [
      [100, easyLoot],
      [100, easyLoot],
      [85, mediumLoot],
      [50, mediumLoot],
      [60, hardLoot],
      [25, hardLoot],
    ]
  ),
]
