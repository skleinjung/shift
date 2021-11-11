import { keys, reduce } from 'lodash/fp'

export interface TerrainType {
  /** unique id for this type of terrain */
  id: TerrainTypeId

  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean
}

const terrainTypeArray = [
  {
    id: 'default',
    traversable: false,
  },
  {
    id: 'door',
    traversable: true,
  },
  {
    id: 'floor',
    traversable: true,
  },
  {
    id: 'water',
    traversable: false,
  },
  {
    id: 'wall',
    traversable: false,
  },
] as const

export const TerrainTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, terrainTypeArray) as Record<typeof terrainTypeArray[number]['id'], TerrainType>

export type TerrainTypeId = keyof typeof TerrainTypes
export const CreatureTypeIds = keys(TerrainTypes) as TerrainTypeId[]