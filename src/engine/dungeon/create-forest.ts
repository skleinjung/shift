// export const createForest = () => createDungeon({
//   maximumRoomArea: 400,
//   maximumRoomCount: 8,
//   minimumHallwayLength: 10,
//   maximumHallwayLength: 20,
//   minimumRoomArea: 144,
//   minimumDimensionSize: 6,
// })

import { random } from 'engine/random'
import { times } from 'lodash/fp'

import { Dungeon } from './dungeon'
import { Region } from './region'
import { generateRoomDimensions } from './utils'

export interface CreateForestOptions {
  /** maximum area of a room */
  maximumRoomArea: number

  /** largest number of rooms */
  maximumRoomCount: number

  /** minimum area of a room */
  minimumRoomArea: number

  /** smallest number of rooms */
  minimumRoomCount: number

  /**
   * How square the room shapes will be. Using zero will generate approximately perfect squares
   * Decimals allowed.
   **/
  roomIrregularity: number

  /** height of the entire dungeon map */
  zoneHeight: number

  /** width of the entire dungeon map */
  zoneWidth: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const maximumPlacementFailures = 500

export const withDefaults = (options: Partial<CreateForestOptions>): CreateForestOptions => ({
  maximumRoomArea: 169,
  maximumRoomCount: 12,
  minimumRoomArea: 36,
  minimumRoomCount: 8,
  roomIrregularity: 0.4,
  zoneWidth: 100,
  zoneHeight: 100,
  ...options,
})

export const createForest = (options: Partial<CreateForestOptions> = {}) => {
  const optionsWithDefaults = withDefaults(options)

  const clearings = times(() => {
    const { width, height } = generateRoomDimensions(optionsWithDefaults)
    const centerX = random(0, optionsWithDefaults.zoneWidth) - (optionsWithDefaults.zoneWidth / 2)
    const centerY = random(0, optionsWithDefaults.zoneHeight) - (optionsWithDefaults.zoneHeight / 2)

    return new Region({
      left: Math.floor(centerX - (width - 1) / 2),
      top: Math.floor(centerY - (height - 1) / 2),
      width,
      height,
    })
  }, random(optionsWithDefaults.minimumRoomCount, optionsWithDefaults.maximumRoomCount))

  return new Dungeon(clearings)
}
