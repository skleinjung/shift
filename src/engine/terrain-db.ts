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
    id: 'portal',
    description: `There is an almost imperceptible curtain of rainbow-colored light here. Visible in your peripheral
vision, it seems to disappear if you look directly at it. In other words, one of the portals you use to shift between
worlds.`,
    name: 'Faint, Shimmering Portal',
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
  // thorn gremlin tiles
  {
    id: 'thorn_gremlin_home',
    name: 'Stony Clearing',
    description: `This is a small, circular clearing in the surrounding briars. In the center of 
the clearing is a black stone statue that bears an uncanny resemblance to the Winter's Breath 
flowers you've seen elsewhere in the forest.`,
    traversable: true,
  },
  {
    id: 'thorn_gremlin_clearing',
    name: 'Briar-Filled Thicket',
    description: `The looming trees of the surrounding forest are absent from this clearing. Instead,
it is devoid of vegetation other than a thick carpet of black, thorn-covered vines.`,
    traversable: true,
  },
] as const

export const TerrainTypes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, terrainTypeArray) as Record<typeof terrainTypeArray[number]['id'], TerrainType>

export type TerrainTypeId = keyof typeof TerrainTypes
export const CreatureTypeIds = keys(TerrainTypes) as TerrainTypeId[]
