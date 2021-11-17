import { keys, reduce } from 'lodash/fp'

export interface TerrainType {
  /** if true, then this type of terrain blocks line of sight */
  blocksLineOfSight: boolean

  /** unique id for this type of terrain */
  id: TerrainTypeId

  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean
}

const terrainTypeArray = [
  {
    id: 'default',
    blocksLineOfSight: true,
    traversable: false,
  },
  {
    id: 'brambles',
    blocksLineOfSight: true,
    traversable: true,
  },
  {
    id: 'door',
    blocksLineOfSight: true,
    traversable: true,
  },
  {
    id: 'floor',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'heavy_brush',
    blocksLineOfSight: true,
    traversable: true,
  },
  {
    id: 'light_brush_1',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'light_brush_2',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'light_brush_3',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'path',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'water',
    blocksLineOfSight: false,
    traversable: false,
  },
  {
    id: 'water_shallow',
    blocksLineOfSight: false,
    traversable: true,
  },
  {
    id: 'wall',
    blocksLineOfSight: true,
    traversable: false,
  },
] as const

export const TerrainTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, terrainTypeArray) as Record<typeof terrainTypeArray[number]['id'], TerrainType>

export type TerrainTypeId = keyof typeof TerrainTypes
export const CreatureTypeIds = keys(TerrainTypes) as TerrainTypeId[]
