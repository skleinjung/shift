/* eslint-disable @typescript-eslint/naming-convention */
import { CreatureTypeId } from 'engine/creature-db'
import { ProductGroup } from 'engine/spawnable'
import { find, random } from 'lodash/fp'

import { ItemTemplate, ItemTemplates } from '../item-db'

import { Dungeon } from './dungeon'
import { Region } from './region'

const armor = ProductGroup.rollOne(
  [
    [25, ItemTemplates.leather_armor],
    [25, ItemTemplates.leather_boots],
    [25, ItemTemplates.soft_leather_gloves],
    [25, ItemTemplates.wooden_buckler],
  ]
)

const weapons = ProductGroup.rollOne(
  [
    [60, ItemTemplates.dagger],
    [30, ItemTemplates.spear],
    [10, ItemTemplates.glowing_spear],
  ]
)

const jewelry = ProductGroup.rollOne(
  [
    [40, ItemTemplates.ring_of_protection],
    [30, ItemTemplates.gold_circlet],
    [15, ItemTemplates.necrotic_amulet],
    [15, ItemTemplates.girdle_of_punching],
  ]
)

const armorOrWeapon = ProductGroup.rollOne(
  [
    [50, armor],
    [50, weapons],
  ]
)

export const TreasureTable = ProductGroup.rollMany(
  [
    [100, armorOrWeapon],
    [20, jewelry],
  ]
)

/** function that adds 'something' to a dungeon */
type Spawner = (dungeon: Dungeon, room: Region) => void

const treasureSpawner = (itemTemplate: ItemTemplate): Spawner => (dungeon, room) => {
  const x = random(room.left, room.right)
  const y = random(room.top, room.bottom)

  dungeon.treasure.push({ item: itemTemplate.create(), x, y })
}

const monsterSpawner = (creatureType: CreatureTypeId): Spawner => (dungeon, room) => {
  let loopCount = 0
  let x = 0
  let y = 0

  const spaceOccupied = (x: number, y: number) => {
    return find((monster) => monster.x === x && monster.y === y, dungeon.creatures) !== undefined
  }

  do {
    x = random(room.left, room.right)
    y = random(room.top, room.bottom)
  } while (spaceOccupied(x, y) && loopCount++ < 50)

  if (!spaceOccupied(x, y)) {
    dungeon.creatures.push({ type: creatureType, x, y })
  }
}

export const easyTreasure = ProductGroup.rollOne(
  [
    [15, treasureSpawner(ItemTemplates.leather_armor)],
    [15, treasureSpawner(ItemTemplates.leather_boots)],
    [15, treasureSpawner(ItemTemplates.soft_leather_gloves)],
    [15, treasureSpawner(ItemTemplates.wooden_buckler)],
    [20, treasureSpawner(ItemTemplates.dagger)],
    [15, treasureSpawner(ItemTemplates.spear)],
    [0, treasureSpawner(ItemTemplates.glowing_spear)],
    [0, treasureSpawner(ItemTemplates.ring_of_protection)],
    [0, treasureSpawner(ItemTemplates.gold_circlet)],
    [5, treasureSpawner(ItemTemplates.necrotic_amulet)],
    [0, treasureSpawner(ItemTemplates.girdle_of_punching)],
  ]
)

export const easyTreasure_x2 = ProductGroup.rollOne(
  [[100, easyTreasure]], 2
)

export const mediumTreasure = ProductGroup.rollOne(
  [
    [15, treasureSpawner(ItemTemplates.leather_armor)],
    [5, treasureSpawner(ItemTemplates.leather_boots)],
    [5, treasureSpawner(ItemTemplates.soft_leather_gloves)],
    [15, treasureSpawner(ItemTemplates.wooden_buckler)],
    [20, treasureSpawner(ItemTemplates.dagger)],
    [15, treasureSpawner(ItemTemplates.spear)],
    [5, treasureSpawner(ItemTemplates.glowing_spear)],
    [5, treasureSpawner(ItemTemplates.ring_of_protection)],
    [5, treasureSpawner(ItemTemplates.gold_circlet)],
    [5, treasureSpawner(ItemTemplates.necrotic_amulet)],
    [5, treasureSpawner(ItemTemplates.girdle_of_punching)],
  ], 2
)

export const mediumTreasure_x2 = ProductGroup.rollOne(
  [[100, mediumTreasure]], 2
)

export const hardTreasure = ProductGroup.rollOne(
  [
    [5, treasureSpawner(ItemTemplates.leather_armor)],
    [0, treasureSpawner(ItemTemplates.leather_boots)],
    [0, treasureSpawner(ItemTemplates.soft_leather_gloves)],
    [5, treasureSpawner(ItemTemplates.wooden_buckler)],
    [5, treasureSpawner(ItemTemplates.dagger)],
    [15, treasureSpawner(ItemTemplates.spear)],
    [25, treasureSpawner(ItemTemplates.glowing_spear)],
    [15, treasureSpawner(ItemTemplates.ring_of_protection)],
    [15, treasureSpawner(ItemTemplates.gold_circlet)],
    [0, treasureSpawner(ItemTemplates.necrotic_amulet)],
    [15, treasureSpawner(ItemTemplates.girdle_of_punching)],
  ]
)

export const hardTreasure_x2 = ProductGroup.rollOne(
  [[100, hardTreasure]], 2
)

export const easyAndMediumTreasure = ProductGroup.rollMany(
  [
    [100, easyTreasure],
    [100, mediumTreasure],
  ]
)

export const hardAndMediumTreasure = ProductGroup.rollMany(
  [
    [100, hardTreasure],
    [100, mediumTreasure],
  ]
)

export const easyMonster = ProductGroup.rollOne(
  [
    [80, monsterSpawner('kobold')],
    [20, monsterSpawner('goblin')],
  ]
)

export const mediumMonster = ProductGroup.rollOne(
  [
    [20, monsterSpawner('kobold')],
    [60, monsterSpawner('goblin')],
    [20, monsterSpawner('orc')],
  ]
)

export const hardMonster = ProductGroup.rollOne(
  [
    [80, monsterSpawner('goblin')],
    [20, monsterSpawner('orc')],
  ]
)

export const easyMonster_x2 = ProductGroup.rollOne(
  [[100, easyMonster]], 2
)

export const mediumMonster_x2 = ProductGroup.rollOne(
  [[100, mediumMonster]], 2
)

export const hardMonster_x2 = ProductGroup.rollOne(
  [[100, hardMonster]], 2
)

export const easyAndMediumMonster = ProductGroup.rollMany(
  [
    [100, easyMonster],
    [100, mediumMonster],
  ]
)

export const hardAndMediumMonster = ProductGroup.rollMany(
  [
    [100, hardMonster],
    [100, mediumMonster],
  ]
)

export const treasure1 = ProductGroup.rollOne(
  [
    [50, easyTreasure],
    [30, mediumTreasure],
    [20, easyTreasure_x2],
  ]
)

export const treasure2 = ProductGroup.rollOne(
  [
    [10, easyTreasure],
    [15, mediumTreasure],
    [25, easyTreasure_x2],
    [25, easyAndMediumTreasure],
    [15, mediumTreasure_x2],
    [10, hardTreasure],
  ]
)

export const treasure3 = ProductGroup.rollOne(
  [
    [10, mediumTreasure],
    [30, mediumTreasure_x2],
    [50, hardTreasure],
    [7, hardAndMediumTreasure],
    [3, hardTreasure_x2],
  ]
)

export const monster1 = ProductGroup.rollOne(
  [
    [50, easyMonster],
    [30, mediumMonster],
    [20, easyMonster_x2],
  ]
)

export const monster2 = ProductGroup.rollOne(
  [
    [10, easyMonster],
    [15, mediumMonster],
    [25, easyMonster_x2],
    [25, easyAndMediumMonster],
    [15, mediumMonster_x2],
    [10, hardMonster],
  ]
)

export const monster3 = ProductGroup.rollOne(
  [
    [10, mediumMonster],
    [30, mediumMonster_x2],
    [50, hardMonster],
    [7, hardAndMediumMonster],
    [3, hardMonster_x2],
  ]
)

export const monsterOnly = ProductGroup.rollOne(
  [
    [50, monster1],
    [30, monster2],
    [20, monster3],
  ]
)

export const monster1_treasure1 = ProductGroup.rollMany(
  [
    [100, monster1],
    [100, treasure1],
  ]
)

export const monster1_treasure2 = ProductGroup.rollMany(
  [
    [100, monster1],
    [100, treasure2],
  ]
)

export const monster1_treasure3 = ProductGroup.rollMany(
  [
    [100, monster1],
    [100, treasure3],
  ]
)

export const monster2_treasure1 = ProductGroup.rollMany(
  [
    [100, monster2],
    [100, treasure1],
  ]
)

export const monster2_treasure2 = ProductGroup.rollMany(
  [
    [100, monster2],
    [100, treasure2],
  ]
)

export const monster2_treasure3 = ProductGroup.rollMany(
  [
    [100, monster2],
    [100, treasure3],
  ]
)

export const monster3_treasure1 = ProductGroup.rollMany(
  [
    [100, monster3],
    [100, treasure1],
  ]
)

export const monster3_treasure2 = ProductGroup.rollMany(
  [
    [100, monster3],
    [100, treasure2],
  ]
)

export const monster3_treasure3 = ProductGroup.rollMany(
  [
    [100, monster3],
    [100, treasure3],
  ]
)

export const harderMonsterAndTreasure = ProductGroup.rollOne(
  [
    [75, monster2_treasure1],
    [75, monster3_treasure1],
    [75, monster3_treasure2],
  ]
)

export const matchedMonsterAndTreasure = ProductGroup.rollOne(
  [
    [50, monster1_treasure1],
    [30, monster2_treasure2],
    [20, monster3_treasure3],
  ]
)

export const easierMonsterAndTreasure = ProductGroup.rollOne(
  [
    [60, monster1_treasure2],
    [25, monster2_treasure3],
    [15, monster1_treasure3],
  ]
)

export const treasureOnly = ProductGroup.rollOne(
  [
    [50, treasure1],
    [30, treasure2],
    [20, treasure3],
  ]
)

/** room contents that have a worse-than-average ratio of monsters and treasure */
export const worse = ProductGroup.rollOne(
  [
    [60, harderMonsterAndTreasure],
    [40, monsterOnly],
  ]
)

/** room contents that have a better-than-average ratio of monsters and treasure */
export const better = ProductGroup.rollOne(
  [
    [60, easierMonsterAndTreasure],
    [40, treasureOnly],
  ]
)

const RoomContents = ProductGroup.rollOne(
  [
    [25, worse],
    [50, matchedMonsterAndTreasure],
    [25, better],
  ]
)

/** rooms have a 25% chance for contents of any kind */
export const RoomSpawnTable = ProductGroup.rollMany(
  [
    [66, RoomContents],
  ]
)
