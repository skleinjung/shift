import { keys, reduce } from 'lodash/fp'

export interface TerrainType {
  /** optional default description for this terrain type */
  description?: string

  /** default tile name for this terrain type, if the map doesn't override it */
  name: string

  /** unique id for this type of terrain */
  id: TerrainTypeId

  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean

  /** % of visibility reduction caused by this tile, from 0-100% (default: 0) */
  visibilityReduction?: number
}

const terrainTypeArray = [
  {
    id: 'default',
    name: 'Unknown Region',
    traversable: false,
    visibilityReduction: 100,
  },
  {
    id: 'brambles',
    name: 'Thick Brambles',
    traversable: true,
    visibilityReduction: 50,
  },
  {
    id: 'door',
    name: 'A Doorway',
    traversable: true,
    visibilityReduction: 100,
  },
  {
    id: 'floor',
    name: 'a floor',
    traversable: true,
  },
  {
    id: 'heavy_brush',
    name: 'Deep Forest',
    traversable: true,
    visibilityReduction: 20,
  },
  {
    id: 'light_brush_1',
    name: 'Flower-Filled Clearing',
    traversable: true,
  },
  {
    id: 'light_brush_2',
    name: 'An Open Space',
    traversable: true,
  },
  {
    id: 'light_brush_3',
    name: 'Forest',
    traversable: true,
  },
  {
    id: 'path',
    description: `This narrow dirt trail has been partially overtaken by brush. Although you see no clear footprints
or wagon tracks, something has kept the surrounding forest from reclaiming this space.`,
    name: 'Lightly-Trodden Path',
    traversable: true,
  },
  {
    id: 'water',
    name: 'Deep Water',
    traversable: false,
  },
  {
    id: 'water_shallow',
    name: 'Shallows',
    traversable: true,
  },
  {
    id: 'wall',
    name: 'Non-Descript Wall',
    traversable: false,
    visibilityReduction: 100,
  },
] as const

export const TerrainTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, terrainTypeArray) as Record<typeof terrainTypeArray[number]['id'], TerrainType>

export type TerrainTypeId = keyof typeof TerrainTypes
export const CreatureTypeIds = keys(TerrainTypes) as TerrainTypeId[]
