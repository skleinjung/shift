import { CreatureScript } from 'engine/api/creature-script'
import { MapApi } from 'engine/api/map-api'
import { hardLoot } from 'engine/data/loot-tables'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { random } from 'engine/random'
import { pullAt } from 'lodash'
import { forEach, sample } from 'lodash/fp'

export const thornGremlin: CreatureScript = {
  onCreate: ({ creature }, api) => {
    createClearing(api, creature.x, creature.y, 30)
    api.setTerrain(creature.x, creature.y, 'thorn_gremlin_home')

    const itemSpawnLocation = sample(getAdjacentCoordinates(creature))
    if (itemSpawnLocation !== undefined) {
      const item = hardLoot.collect()[0].create()
      api.addMapItem(item, itemSpawnLocation.x, itemSpawnLocation.y)
    }
  },
}

const createClearing = (api: MapApi, x: number, y: number, maxSize: number) => {
  const possibleNewCells = [{ x, y }]

  let size = 0
  while (size++ < maxSize && possibleNewCells.length > 0) {
    const index = random(0, possibleNewCells.length - 1)
    const [newCell] = pullAt(possibleNewCells, index)

    const neighbors = getAdjacentCoordinates(newCell)
    forEach((neighbor) => {
      if (api.getMapTile(neighbor.x, neighbor.y)?.terrain.id !== 'thorn_gremlin_clearing') {
        possibleNewCells.push(neighbor)
      }
    }, neighbors)

    api.setTerrain(newCell.x, newCell.y, 'thorn_gremlin_clearing')
  }
}
