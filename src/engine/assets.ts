import Jimp from 'jimp'

import { ForestMap } from './data/forest-map'
import { TerrainType, TerrainTypes } from './terrain-db'

// TODO: allow specifying 'region' boundaries
export interface MapImageConfig {
  /** map associating colors in the source image with terrain types */
  colorMap: { [k in number]?: TerrainType | undefined }

  /** id of this asset */
  id: string

  /** image source (filename, base64-encoded image, etc) */
  source: string
}

export type ScanFunction = (x: number, y: number, terrain: TerrainType) => void

/** Metadata and terrain information for a static map */
export interface MapAsset extends MapImageConfig {
  /** height of the map */
  height: number

  /** calls the given function for every tile in the map bounds */
  scan: (scanFunction: ScanFunction) => void

  /** width of the map */
  width: number
}

const assets = {} as { [k: string]: MapAsset }

const loadMap = async (config: MapImageConfig): Promise<MapAsset> => {
  const image = await Jimp.read(config.source)

  return {
    ...config,
    height: image.bitmap.height,
    width: image.bitmap.width,
    scan: (scanFunction: ScanFunction) => {
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
        const r = image.bitmap.data[index]
        const g = image.bitmap.data[index + 1]
        const b = image.bitmap.data[index + 2]
        const color = (r << 16) | (g << 8) | b

        scanFunction(x, y, config.colorMap[color] ?? TerrainTypes.default)
      })
    },
  }
}

export const loadAll = async () => {
  assets.forest = await loadMap(ForestMap)
}

export const getAsset = (name: string): MapAsset => assets[name]
