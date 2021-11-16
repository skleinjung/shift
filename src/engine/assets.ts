import Jimp from 'jimp'

import { ForestMapBase } from './data/forest-map-base'
import { TerrainType, TerrainTypes } from './terrain-db'

// TODO: allow specifying 'region' boundaries
export interface MapImageConfig {
  /** map associating colors in the source image with terrain types */
  colorMap: { [k in number]?: TerrainType | undefined }

  /** default terrain type to render for cells outside the map (default: default) */
  defaultTerrain?: TerrainType

  /** id of this asset */
  id: string

  /** x-offset of this map, assuming player origin of (0,0) -- default: 0 */
  offsetX?: number

  /** x-offset of this map, assuming player origin of (0,0) -- default: 0 */
  offsetY?: number

  /** image source (filename, base64-encoded image, etc) */
  source: string
}

export type ScanFunction = (x: number, y: number, terrain: TerrainType) => void

/** Metadata and terrain information for a static map */
export interface MapAsset extends MapImageConfig {
  /** default terrain type to render for cells outside the map (default: default) */
  defaultTerrain: TerrainType

  /** gets the terrain at (x, y) of the map */
  getTerrain: (x: number, y: number) => TerrainType

  /** height of the map */
  height: number

  /** x-offset of this map, assuming player origin of (0,0) -- default: 0 */
  offsetX: number

  /** x-offset of this map, assuming player origin of (0,0) -- default: 0 */
  offsetY: number

  /** calls the given function for every tile in the map bounds */
  scan: (scanFunction: ScanFunction) => void

  /** width of the map */
  width: number
}

const assets = {} as { [k: string]: MapAsset }

const loadMap = async (config: MapImageConfig): Promise<MapAsset> => {
  const image = await Jimp.read(config.source)

  const offsetX = config.offsetX ?? 0
  const offsetY = config.offsetY ?? 0

  const getTerrainWithoutDefault = (x: number, y: number) => {
    const index = image.getPixelIndex(x - offsetX, y - offsetY)

    const r = image.bitmap.data[index]
    const g = image.bitmap.data[index + 1]
    const b = image.bitmap.data[index + 2]
    const color = (r << 16) | (g << 8) | b

    return config.colorMap[color]
  }

  const getTerrain = (x: number, y: number) => {
    return getTerrainWithoutDefault(x, y) ?? TerrainTypes.default
  }

  return {
    defaultTerrain: TerrainTypes.default,
    ...config,
    getTerrain,
    height: image.bitmap.height,
    offsetX,
    offsetY,
    width: image.bitmap.width,
    scan: (scanFunction: ScanFunction) => {
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y) => {
        const terrain = getTerrainWithoutDefault(x + offsetX, y + offsetY)
        if (terrain !== undefined) {
          // only include defined cells, so the map is sparsely populated
          scanFunction(x + offsetX, y + offsetY, terrain)
        }
      })
    },
  }
}

export const loadAll = async () => {
  assets.forest_base = await loadMap(ForestMapBase)
}

export const getAsset = (name: string): MapAsset => assets[name]
