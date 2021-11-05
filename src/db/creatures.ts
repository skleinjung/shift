import { Renderable } from 'db/renderable'
import { snakeCase, toLower } from 'lodash/fp'
import { Behavior, MoveRandomlyBehavior, PlayerBehavior } from 'world/behavior'

export type CreatureType = Readonly<Renderable & {
  /** behavior used to determine this creature's actions */
  behavior: Behavior

  /** maximum health of creatures of this type */
  healthMax: number

  id: string

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
  healthMax: 10,
  name: 'Player',
  symbol: '@',
})

addCreatureType({
  background: 0x220000,
  behavior: MoveRandomlyBehavior,
  color: 0x990000,
  healthMax: 2,
  name: 'Kobold',
  symbol: 'k',
})

addCreatureType({
  background: 0x220000,
  behavior: MoveRandomlyBehavior,
  color: 0x990000,
  healthMax: 5,
  name: 'Goblin',
  symbol: 'g',
})

addCreatureType({
  background: 0x220000,
  behavior: MoveRandomlyBehavior,
  color: 0x990000,
  healthMax: 8,
  name: 'Orc',
  symbol: 'o',
})
