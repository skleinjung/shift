import { withDefaults } from 'engine/dungeon/create-forest'
import { Dungeon } from 'engine/dungeon/dungeon'
import { Region } from 'engine/dungeon/region'
import { generateRoomDimensions } from 'engine/dungeon/utils'
import { Script } from 'engine/engine'
import { random } from 'engine/random'
import { TerrainTypes } from 'engine/terrain-db'

const options = withDefaults({})

export const buildForest = (): Script => {
  const dungeon = new Dungeon([])

  const pathToX = -120
  const pathToY = -50
  let pathY = 0
  let pathX = 0

  return {
    onUpdate: ({ world }) => {
      const { width, height } = generateRoomDimensions(options)
      const centerX = random(0, options.zoneWidth) - (options.zoneWidth / 2)
      const centerY = random(0, options.zoneHeight) - (options.zoneHeight / 2)

      if (dungeon.regions.length < 15) {
        dungeon.regions.push(new Region({
          left: Math.floor(centerX - (width - 1) / 2),
          top: Math.floor(centerY - (height - 1) / 2),
          width,
          height,
        }))

        dungeon.createTerrain(world.map)
      } else {
        const slope = (0.0 - pathToY) / (0.0 - pathToX)
        const xChange = (pathY - 0) * (1.0 / slope)
        pathX = 0 + xChange
        world.map.setTerrain(Math.floor(pathX), Math.floor(pathY), TerrainTypes.water)
        pathY = pathY - 1
        // eslint-disable-next-line no-console
        console.log(pathX, pathY)
      }

      world.emit('update')
    },
  }
}
