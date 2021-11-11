import assert from 'assert'

import { MoveToAction } from 'engine/actions/move-to'
import { Creature } from 'engine/creature'
import { Region } from 'engine/dungeon/region'
import { CellCoordinate } from 'engine/map/map'
import { random } from 'engine/random'
import { Behavior } from 'engine/types'
import { World } from 'engine/world'
import { sample } from 'lodash/fp'

/** maximum number of attempts to pick a valid destination before a creature gives up */
const MAX_ATTEMPTS = 50

export const wanderBetweenRooms = (): Behavior => {
  let destinationRoom: Region | undefined
  let destinationCell: CellCoordinate | undefined

  return (creature: Creature, world: World) => {
    const rooms = world.dungeon.rooms
    if (rooms.length < 1) {
      return undefined
    }

    let attempt = 0
    let nextCell: CellCoordinate | undefined

    while (attempt++ < MAX_ATTEMPTS && nextCell === undefined) {
      // if we have reached our destination, clear it so we can set a new one
      if (creature.x === destinationCell?.x && creature.y === destinationCell?.y) {
        destinationRoom = undefined
        destinationCell = undefined
      }

      if (destinationRoom === undefined) {
        destinationRoom = sample(world.dungeon.rooms)
      }
      assert(destinationRoom !== undefined)

      if (destinationCell === undefined) {
        destinationCell = {
          x: random(destinationRoom.left, destinationRoom.right),
          y: random(destinationRoom.top, destinationRoom.bottom),
        }
      }

      const path = world.map.getPath(creature, destinationCell)
      if (path.length > 1) {
        if (world.map.isTraversable(path[1].x, path[1].y)) {
          nextCell = path[1]
        }
      }

      if (nextCell === undefined) {
        // clear destinations so we can try again
        destinationRoom = undefined
        destinationCell = undefined
      }
    }

    // if nextCell is undefined, we ran out of attempts to find a path
    return nextCell === undefined
      ? undefined
      : new MoveToAction(creature, nextCell.x, nextCell.y)
  }
}
