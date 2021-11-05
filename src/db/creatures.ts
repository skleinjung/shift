import { Renderable } from 'db/renderable'

export type CreatureType = Readonly<Renderable & {
  /** maximum health of creatures of this type */
  healthMax: number

  id: number

  name: string
}>

export const CreatureTypes: Record<number, CreatureType> = {}

let nextId = 0
const addCreatureType = (creature: Omit<CreatureType, 'id'>) => {
  const id = nextId++
  CreatureTypes[id] = {
    ...creature,
    id,
  }
  return id
}

export const PlayerCreatureTypeId = addCreatureType({
  color: 0xffffff,
  healthMax: 10,
  name: 'Player',
  symbol: '@',
})
