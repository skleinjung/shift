import { Renderable } from 'db/renderable'
import {
  AttackAdjacentPlayerBehavior,
  Behavior,
  CompoundBehavior,
  MoveRandomlyBehavior,
  PlayerBehavior,
} from 'engine/behavior'
import { snakeCase, toLower } from 'lodash/fp'

export type CreatureType = Readonly<Renderable & {
  /** behavior used to determine this creature's actions */
  behavior: Behavior

  /** defense stat for this creature */
  defense: number

  /** maximum health of creatures of this type */
  healthMax: number

  /** unique id for this creature type */
  id: string

  /** melee stat for this creature */
  melee: number

  /** name of this creature type */
  name: string
}>

export const CreatureTypes: Record<CreatureType['id'], CreatureType> = {}

const addCreatureType = (creature: Omit<CreatureType, 'id'>, id?: string) => {
  const resolvedId = id ?? snakeCase(toLower(creature.name))
  CreatureTypes[resolvedId] = {
    ...creature,
    id: resolvedId,
  }
  return id
}

addCreatureType({
  background: 0x002200,
  behavior: PlayerBehavior,
  color: 0xffffff,
  defense: 0,
  healthMax: 10,
  melee: 1,
  name: 'Player',
  symbol: '@',
})

addCreatureType({
  background: 0x220000,
  behavior: AttackAdjacentPlayerBehavior,
  color: 0x990000,
  defense: 0,
  healthMax: 2,
  melee: 1,
  name: 'Kobold',
  symbol: 'k',
})

addCreatureType({
  background: 0x220000,
  behavior: CompoundBehavior(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(100)),
  color: 0x990000,
  defense: 1,
  healthMax: 5,
  melee: 1,
  name: 'Goblin',
  symbol: 'g',
})

addCreatureType({
  background: 0x220000,
  behavior: CompoundBehavior(AttackAdjacentPlayerBehavior, MoveRandomlyBehavior(20)),
  color: 0x990000,
  defense: 1,
  healthMax: 8,
  melee: 2,
  name: 'Orc',
  symbol: 'o',
})
