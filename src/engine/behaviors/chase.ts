import { MoveToAction } from 'engine/actions/move-to'
import { Creature } from 'engine/creature'
import { CellCoordinate } from 'engine/map/map'
import { Behavior } from 'engine/types'

export const chase = (target: Creature): Behavior => {
  let destination: CellCoordinate | undefined
  let path: CellCoordinate[] | undefined
  let pathIndex = 0

  return (creature, world) => {
    if (destination?.x !== target.x || destination?.y !== target.y) {
      destination = { x: target.x, y: target.y }
      path = world.map.getPath(creature, target)
      pathIndex = 1
    }

    if (path !== undefined && path?.length >= pathIndex) {
      const nextCell = path[pathIndex++]
      if (world.map.isTraversable(nextCell.x, nextCell.y)) {
        return new MoveToAction(creature, nextCell.x, nextCell.y)
      }
    }

    return undefined
  }
}
