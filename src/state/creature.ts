import { Renderable } from 'world/renderable'
import { Terrain } from 'world/terrain'

import { getMap } from './map'

export interface Creature extends Renderable {
  /** x-coordiante of the creature's position */
  x: number

  /** y-coordiante of the creature's position */
  y: number
}

export const moveBy = (byX: number, byY: number) => <T extends Creature>(creature: T): T => {
  const map = getMap()

  const oldCell = map[creature.y][creature.x]
  const newCell = map[creature.y + byY][creature.x + byX]

  if (oldCell !== undefined) {
    oldCell.creature = undefined
  }

  if (newCell === undefined) {
    // creature moved off the known map, create a default cell
    map[creature.y + byY][creature.x + byX] = {
      terrain: Terrain.Default,
    }
  }

  map[creature.y + byY][creature.x + byX].creature = creature

  return {
    ...creature,
    x: creature.x + byX,
    y: creature.y + byY,
  }
}
