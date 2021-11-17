import { keys, reduce } from 'lodash/fp'

export interface TerrainType {
  /** if true, then this type of terrain blocks line of sight */
  blocksLineOfSight: boolean

  /** optional default description for this terrain type */
  description?: string

  /** default tile name for this terrain type, if the map doesn't override it */
  name: string

  /** unique id for this type of terrain */
  id: TerrainTypeId

  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean
}

const terrainTypeArray = [
  {
    id: 'default',
    blocksLineOfSight: true,
    name: 'Unknown Region',
    traversable: false,
  },
  {
    id: 'brambles',
    blocksLineOfSight: true,
    name: 'Thick Brambles',
    traversable: true,
  },
  {
    id: 'door',
    blocksLineOfSight: true,
    name: 'A Doorway',
    traversable: true,
  },
  {
    id: 'floor',
    blocksLineOfSight: false,
    name: 'a floor',
    traversable: true,
  },
  {
    id: 'heavy_brush',
    blocksLineOfSight: true,
    name: 'Lost in the Forest',
    traversable: true,
  },
  {
    id: 'light_brush_1',
    blocksLineOfSight: false,
    name: 'Flower-Filled Clearing',
    traversable: true,
  },
  {
    id: 'light_brush_2',
    blocksLineOfSight: false,
    name: 'An Open Space',
    traversable: true,
  },
  {
    id: 'light_brush_3',
    blocksLineOfSight: false,
    name: 'Forest',
    traversable: true,
  },
  {
    id: 'path',
    blocksLineOfSight: false,
    description: `This narrow dirt trail has been partially overtaken by brush. Although you see no clear footprints
or wagon tracks, something has kept the surrounding forest from reclaiming this space.`,
    name: 'Lightly-Trodden Path',
    traversable: true,
  },
  {
    id: 'water',
    blocksLineOfSight: false,
    name: 'Deep Water',
    traversable: false,
  },
  {
    id: 'water_shallow',
    blocksLineOfSight: false,
    name: 'Shallows',
    traversable: true,
  },
  {
    id: 'wall',
    blocksLineOfSight: true,
    name: 'Non-Descript Wall',
    traversable: false,
  },
] as const

export const TerrainTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, terrainTypeArray) as Record<typeof terrainTypeArray[number]['id'], TerrainType>

export type TerrainTypeId = keyof typeof TerrainTypes
export const CreatureTypeIds = keys(TerrainTypes) as TerrainTypeId[]
