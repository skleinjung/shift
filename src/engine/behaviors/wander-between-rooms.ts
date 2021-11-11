import assert from 'assert'

import { Creature } from 'engine/creature'
import { Region } from 'engine/dungeon/region'
import { CellCoordinate } from 'engine/map/map'
import { random } from 'engine/random'
import { Behavior } from 'engine/types'
import { World } from 'engine/world'
import { sample } from 'lodash/fp'

import { DestinationFunction, pathFindingBehavior } from './path-finding-behavior'

const getDestination = (): DestinationFunction => {
  let destinationRoom: Region | undefined
  let destinationCell: CellCoordinate | undefined

  return (creature: Creature, world: World, unreachable: boolean) => {
    const rooms = world.dungeon.rooms
    if (rooms.length < 1) {
      return undefined
    }

    // if we have reached our destination (or it is unreachable) clear it so we can set a new one
    const reachedDestination = creature.x === destinationCell?.x && creature.y === destinationCell?.y
    if (reachedDestination || unreachable) {
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

    return destinationCell
  }
}

export const wanderBetweenRooms = (): Behavior => pathFindingBehavior(getDestination())
