import {
  AttackAdjacentPlayerBehavior,
  Behavior,
  CompoundBehavior,
  MoveRandomlyBehavior,
  PlayerBehavior,
} from 'engine/behavior'
import { filter, keys, reduce } from 'lodash/fp'

export type CreatureType = Readonly<{
  /** behavior used to determine this creature's actions */
  behavior: Behavior

  /** defense stat for this creature */
  defense: number

  /** maximum health of creatures of this type */
  healthMax: number

  /** unique id for this creature type */
  id: CreatureTypeId

  /** melee stat for this creature */
  melee: number

  /** name of this creature type */
  name: string
}>

const creatureTypeArray = [
  {
    behavior: CompoundBehavior(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(100)),
    defense: 1,
    healthMax: 5,
    id: 'goblin',
    melee: 1,
    name: 'Goblin',
  },
  {
    behavior: AttackAdjacentPlayerBehavior,
    defense: 0,
    healthMax: 2,
    id: 'kobold',
    melee: 1,
    name: 'Kobold',
  },
  {
    behavior: CompoundBehavior(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(20)),
    defense: 1,
    healthMax: 8,
    id: 'orc',
    melee: 2,
    name: 'Orc',
  },
  {
    behavior: PlayerBehavior,
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
