import { BehaviorFactory } from 'engine/types'
import { filter, keys, reduce } from 'lodash/fp'

import { attackPlayer } from './behaviors/attack'
import { BehaviorChain } from './behaviors/behavior-chain'
import { maybeIdle } from './behaviors/idle'
import { MoveRandomlyBehavior } from './behaviors/move-randomly'
import { retaliate } from './behaviors/retaliate'
import { wanderBetweenRooms } from './behaviors/wander-between-rooms'
import { MonsterLootTables } from './data/loot-tables'
import { ItemTemplate } from './item-db'
import { CreatureScript } from './script-api'
import { ageSensor } from './scripts/age-sensor'
import { dartLizard } from './scripts/dart-lizard'
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

  /** custom scripts for this creature type, if any */
  scripts?: CreatureScript[]

  /** rate at which a creature acts; 100 == one move or standard attack per turn */
  speed: number
}>

const moveRandom100Percent = maybeIdle(MoveRandomlyBehavior(), 0)
const moveRandom20Percent = maybeIdle(MoveRandomlyBehavior(), 80)
const wander100Percent = maybeIdle(wanderBetweenRooms(), 0)

const creatureTypeArray = [
  {
    createBehavior: () => MoveRandomlyBehavior(),
    defense: 0,
    healthMax: 2,
    id: 'dart_lizard',
    lootTable: MonsterLootTables[1],
    melee: 1,
    name: 'Dart Lizard',
    scripts: [ageSensor, dartLizard],
    speed: 100,
  },
  {
    createBehavior: () => BehaviorChain(retaliate, attackPlayer, moveRandom100Percent),
    defense: 1,
    healthMax: 3,
    id: 'goblin',
    lootTable: MonsterLootTables[1],
    melee: 1,
    name: 'Goblin',
    speed: 100,
  },
  {
    createBehavior: () => BehaviorChain(retaliate, wander100Percent),
    defense: 0,
    healthMax: 2,
    id: 'kobold',
    lootTable: MonsterLootTables[0],
    melee: 1,
    name: 'Kobold',
    speed: 75,
  },
  {
    createBehavior: () => BehaviorChain(retaliate, attackPlayer, moveRandom20Percent),
    defense: 1,
    healthMax: 8,
    id: 'orc',
    lootTable: MonsterLootTables[2],
    melee: 2,
    name: 'Orc',
    speed: 100,
  },
  {
    // player creates its own behavior, so implement a noop here
    createBehavior: () => () => undefined,
    defense: 0,
    healthMax: 10,
    id: 'player',
    melee: 1,
    name: 'Player',
    speed: 100,
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
