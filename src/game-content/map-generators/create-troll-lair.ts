import { Dungeon } from 'engine/dungeon/dungeon'
import { BasicRegion, Region } from 'engine/dungeon/region'
import { RoomSpawnTable } from 'engine/dungeon/spawn-tables'
import { generateRoomDimensions } from 'engine/dungeon/utils'
import { random } from 'engine/random'
import { tail } from 'lodash'

export interface CreateDungeonOptions {
  /** maximum number of room placements that can fail before a level is terminated */
  maximumPlacementFailures: number

  /** maximum area of a room */
  maximumRoomArea: number

  /** largest number of rooms */
  maximumRoomCount: number

  /** maximum distance from one room's wall to another room's center */
  maximumHallwayLength: number

  /** minimum hallway length between two rooms connected on the first pass */
  minimumHallwayLength: number

  /** minimum area of a room */
  minimumRoomArea: number

  /** minimum size for one dimension of the room (width or height)  */
  minimumDimensionSize: number

  /** maximum # of monsters to spawn */
  monsterCountMaximum: number

  /** minimum # of monsters to spawn */
  monsterCountMinimum: number

  /** maximum # of treasures to spawn */
  treasureCountMaximum: number

  /** minimum # of treasures to spawn */
  treasureCountMinimum: number

  /**
   * How square the room shapes will be. Using zero will generate approximately perfect squares
   * Decimals allowed.
   **/
  roomIrregularity: number
}

const withDefaults = (options: Partial<CreateDungeonOptions>): CreateDungeonOptions => ({
  maximumPlacementFailures: 500,
  maximumRoomArea: 50,
  maximumRoomCount: 10,
  maximumHallwayLength: 5,
  minimumRoomArea: 4,
  minimumHallwayLength: 1,
  minimumDimensionSize: 2,
  monsterCountMaximum: 12,
  monsterCountMinimum: 10,
  roomIrregularity: 0.75,
  treasureCountMaximum: 12,
  treasureCountMinimum: 10,
  ...options,
})

const createRoom = (doorwayX: number, doorwayY: number, origin: Region, options: CreateDungeonOptions) => {
  const { height, width } = generateRoomDimensions(options)

  const getLeft = () => {
    if (doorwayX < origin.left) {
      // new room is left of hallway
      return doorwayX - width// account for walls
    } else if (doorwayX > origin.right) {
      // new room is right of hallway
      return doorwayX + 1
    } else {
      // vertical hallway
      return doorwayX - random(0, width - 1)
    }
  }

  const getTop = () => {
    if (doorwayY < origin.top) {
      // new room is above hallway
      return doorwayY - height// account for walls
    } else if (doorwayY > origin.bottom) {
      // new room is below hallway
      return doorwayY + 1
    } else {
      // horizontal hallway
      return doorwayY - random(0, height - 1)
    }
  }

  return new BasicRegion({
    width,
    height,
    left: getLeft(),
    top: getTop(),
  })
}

const createDungeonRecursive = (
  failures: number,
  options: CreateDungeonOptions,
  dungeon: Dungeon
): Dungeon => {
  const { rooms, tunnels } = dungeon

  if (failures >= options.maximumPlacementFailures) {
    return dungeon
  }

  if (rooms.length >= options.maximumRoomCount) {
    return dungeon
  }

  const originRoom = rooms[random(0, rooms.length - 1)]

  let tunnelX1 = 0
  let tunnelY1 = 0
  let tunnelX2 = 0
  let tunnelY2 = 0
  let doorwayX = 0
  let doorwayY = 0

  const minDistance = options.minimumHallwayLength
  const maxDistance = options.maximumHallwayLength

  switch (random(1, 4)) {
    // up
    case 1:
      tunnelX1 = tunnelX2 = random(originRoom.left, originRoom.right)
      tunnelY1 = originRoom.top - 1 - random(minDistance, maxDistance)
      tunnelY2 = originRoom.top - 1
      doorwayX = tunnelX1
      doorwayY = tunnelY1
      break

    // down
    case 2:
      tunnelX1 = tunnelX2 = random(originRoom.left, originRoom.right)
      tunnelY1 = originRoom.bottom + 1
      tunnelY2 = originRoom.bottom + 1 + random(minDistance, maxDistance)
      doorwayX = tunnelX1
      doorwayY = tunnelY2
      break

    // left
    case 3:
      tunnelY1 = tunnelY2 = random(originRoom.top, originRoom.bottom)
      tunnelX1 = originRoom.left - 1 - random(minDistance, maxDistance)
      tunnelX2 = originRoom.left - 1
      doorwayX = tunnelX1
      doorwayY = tunnelY1
      break

    // right
    case 4:
      tunnelY1 = tunnelY2 = random(originRoom.top, originRoom.bottom)
      tunnelX1 = originRoom.right + 1 + random(minDistance, maxDistance)
      tunnelX2 = originRoom.right + 1
      doorwayX = tunnelX2
      doorwayY = tunnelY1
      break
  }

  const newRoom = createRoom(doorwayX, doorwayY, originRoom, options)

  const newTunnel: Region = new BasicRegion({
    left: tunnelX1,
    top: tunnelY1,
    width: Math.abs(tunnelX2 - tunnelX1) + 1,
    height: Math.abs(tunnelY2 - tunnelY1) + 1,
    type: 'tunnel',
  })

  return !dungeon.wouldFit(newRoom, options.minimumHallwayLength + 1)
    ? createDungeonRecursive(failures + 1, options, dungeon)
    : createDungeonRecursive(failures, options, new Dungeon(
      [...rooms, ...tunnels, newRoom, newTunnel]
    ))
}

const populate = (dungeon: Dungeon, _: CreateDungeonOptions) => {
  // populate every room except starting room
  for (const room of tail(dungeon.rooms)) {
    const contents = RoomSpawnTable.collect()

    for (const spawner of contents) {
      spawner(dungeon, room)
    }
  }
}

export const createTrollLair = (options: Partial<CreateDungeonOptions> = {}) => {
  const optionsWithDefaults = withDefaults(options)

  const { width, height } = generateRoomDimensions(optionsWithDefaults)

  const dungeon = createDungeonRecursive(0, optionsWithDefaults, new Dungeon(
    [new BasicRegion({
      left: Math.floor(-(width - 1) / 2),
      top: Math.floor(-(height - 1) / 2),
      width,
      height,
    })]
  ))

  populate(dungeon, optionsWithDefaults)

  return dungeon
}
