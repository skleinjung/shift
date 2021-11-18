/* eslint-disable @typescript-eslint/no-unused-vars */
import { castRay } from 'engine/map/cast-ray'
import { plotArc, plotCircle } from 'engine/map/plot-circle'
import { plotLine } from 'engine/map/plot-line'
import { CreatureScript } from 'engine/script-api'
import { Direction, getFacing } from 'engine/sensors/facing-sensor'
import { forEach } from 'lodash/fp'

const distance = 8
const fov = 45

const toRadians = (degrees: number) => degrees * (Math.PI / 180)

const getFacingRotation = (facing: Direction) => {
  switch (facing) {
    case 'right':
      return 0
    case 'up-right':
      return 45
    case 'up':
      return 90
    case 'up-left':
      return 135
    case 'left':
      return 180
    case 'down-left':
      return 225
    case 'down':
      return 270
    case 'down-right':
      return 315
    case 'none':
      return 0
  }
}

export const drawFieldOfView: CreatureScript = {
  onTurnEnd: ({ creature }, api) => {
    const facingRotation = getFacingRotation(getFacing(creature))
    const fovStart = facingRotation - (fov / 2)
    const fovEnd = facingRotation + (fov / 2)

    const x1 = creature.x + Math.round(distance * Math.cos(toRadians(fovStart)))
    const y1 = creature.y - Math.round(distance * Math.sin(toRadians(fovStart)))
    const xMid = creature.x + Math.round(distance * Math.cos(toRadians(facingRotation)))
    const yMid = creature.y - Math.round(distance * Math.sin(toRadians(facingRotation)))
    const x2 = creature.x + Math.round(distance * Math.cos(toRadians(fovEnd)))
    const y2 = creature.y - Math.round(distance * Math.sin(toRadians(fovEnd)))

    const drawCell = (x: number, y: number) => {
      api.setTerrain(x, y, 'water_shallow')
    }

    // const drawRay = (x: number, y: number) => {
    //   const cells = castRay(creature.x, creature.y, x, y)
    //   forEach((cell) => drawCell(cell.x, cell.y), cells)
    // }

    // plotLine(x1, y1, xMid, yMid, drawRay)
    // plotLine(xMid, yMid, x2, y2, drawRay)

    plotCircle(creature.x, creature.y, 20, drawCell)
    // plotArc(creature.x, creature.y, 20, 15, 30, drawCell)
  },
}
