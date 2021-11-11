import { BehaviorFactory } from 'engine/ai/behavior'
import { filter, keys, reduce } from 'lodash/fp'

import { AttackAdjacentPlayerBehavior } from './ai/attack-adjacent-player-behavior'
import { BehaviorChain } from './ai/behavior-chain'
import { MoveRandomlyBehavior } from './ai/move-randomly-behavior'
import { MonsterLootTables } from './data/loot-tables'
import { ItemTemplate } from './item-db'
import { Generator } from './spawnable'

export type CreatureType = Readonly<{
  /** create the behavior used to determine this creature's actions */
  createBehavior: BehaviorFactory

  /** defense stat for this creature */
  defense: number

  /** maximum health of creatures of this type */
  healthMax: number

  /** unique id for this creature type */
  id: CreatureTypeId

  /** loot table for this creature type, if any */
  lootTable?: Generator<ItemTemplate>

  /** melee stat for this creature */
  melee: number

  /** name of this creature type */
  name: string
}>

const creatureTypeArray = [
  {
    createBehavior: () => BehaviorChain(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(100)),
    defense: 1,
    healthMax: 5,
    id: 'goblin',
    lootTable: MonsterLootTables[1],
    melee: 1,
    name: 'Goblin',
  },
  {
    createBehavior: () => AttackAdjacentPlayerBehavior,
    defense: 0,
    healthMax: 2,
    id: 'kobold',
    lootTable: MonsterLootTables[0],
    melee: 1,
    name: 'Kobold',
  },
  {
    createBehavior: () => BehaviorChain(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(20)),
    defense: 1,
    healthMax: 8,
    id: 'orc',
    lootTable: MonsterLootTables[2],
    melee: 2,
    name: 'Orc',
  },
  {
    // player creates its own behavior, so implement a noop here
    createBehavior: () => () => undefined,
    defense: 0,
    healthMax: 10,
    id: 'player',
    melee: 1,
    name: 'Player',
  },
] as const

export const CreatureTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, creatureTypeArray) as Record<typeof creatureTypeArray[number]['id'], CreatureType>

export type CreatureTypeId = keyof typeof CreatureTypes
export const CreatureTypeIds = keys(CreatureTypes) as CreatureTypeId[]
export const MonsterTypeIds =
  filter((id) => id !== 'player', CreatureTypeIds) as Exclude<CreatureTypeId, 'player'>[]
