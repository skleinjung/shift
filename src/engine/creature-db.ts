import { BehaviorFactory } from 'engine/types'
import { filter, keys, reduce } from 'lodash/fp'

import { AttackAdjacentPlayerBehavior } from './behaviors/attack-adjacent-player'
import { BehaviorChain } from './behaviors/behavior-chain'
import { maybeIdle } from './behaviors/idle'
import { MoveRandomlyBehavior } from './behaviors/move-randomly'
import { retaliate } from './behaviors/retaliate'
import { wanderBetweenRooms } from './behaviors/wander-between-rooms'
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

const moveRandom75Percent = maybeIdle(MoveRandomlyBehavior(), 25)
const moveRandom20Percent = maybeIdle(MoveRandomlyBehavior(), 80)
const wander100Percent = maybeIdle(wanderBetweenRooms(), 0)

const creatureTypeArray = [
  {
    createBehavior: () => BehaviorChain(AttackAdjacentPlayerBehavior, moveRandom75Percent),
    defense: 1,
    healthMax: 5,
    id: 'goblin',
    lootTable: MonsterLootTables[1],
    melee: 1,
    name: 'Goblin',
  },
  {
    createBehavior: () => BehaviorChain(retaliate, wander100Percent),
    defense: 0,
    healthMax: 2,
    id: 'kobold',
    lootTable: MonsterLootTables[0],
    melee: 1,
    name: 'Kobold',
  },
  {
    createBehavior: () => BehaviorChain(AttackAdjacentPlayerBehavior, moveRandom20Percent),
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
