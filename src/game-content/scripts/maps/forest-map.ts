import { WorldScript } from 'engine/script-api'
import { filter, random } from 'lodash/fp'
import { distance } from 'math'

export const forestMap: WorldScript = {
  initialize: (environment) => {
    const x = random(-70, 30)
    const y = random(-100, -90)
    environment.addCreature('thorn_gremlin', x, y)
  },
  onTurn: (environment) => {
    // if there are fewer than 2 toads, spawn one in a random river tile that
    // is 25 tiles away from the player's location
    const toads = filter((creature) => creature.type.id === 'river_toad', environment.creatures)
    if (toads.length < 2) {
      const player = environment.player
      const spawnLocation = environment.getRandomLocation((tile) => {
        return tile.terrain.id === 'water_shallow' && distance(tile.x, tile.y, player.x, player.y) > 25
      })

      if (spawnLocation !== undefined) {
        environment.addCreature('river_toad', spawnLocation.x, spawnLocation.y)
      }
    }
  },
}
