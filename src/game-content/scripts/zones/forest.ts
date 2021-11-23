import { WorldScript } from 'engine/api/script-interfaces'
import { createForest } from 'engine/dungeon/create-forest'
import { Item } from 'engine/item'
import { filter } from 'lodash/fp'
import { distance } from 'math'

export const forest: WorldScript = {
  onInitializeWorld: ({ api, world }) => {
    world.initializeFromDungeon(createForest())

    const spawnLocation = api.getRandomLocation((tile) => {
      return tile.terrain.id === 'heavy_brush'
    })
    if (spawnLocation !== undefined) {
      api.addCreature('thorn_gremlin', spawnLocation.x, spawnLocation.y)
    }

    api.addMapItem(new Item({ name: 'half-eaten hunk of rotting toad meat' }), -15, -40)
    api.setTileDescription(-15, -40, `The heavily decayed body of an extremely large toad is
on the path here. It appears that the creature was eaten by something that came out of the forest to
the southwest. Clawed tracks head off again in that direction, although they appear at least a day or two old.`)
  },
  onTurn: ({ api }) => {
    // if there are fewer than 2 toads, spawn one in a random river tile that
    // is 25 tiles away from the player's location
    const toads = filter((creature) => creature.type.id === 'river_toad', api.creatures)
    if (toads.length < 2) {
      const player = api.player
      const spawnLocation = api.getRandomLocation((tile) => {
        return tile.terrain.id === 'water_shallow' && distance(tile.x, tile.y, player.x, player.y) > 25
      })

      if (spawnLocation !== undefined) {
        api.addCreature('river_toad', spawnLocation.x, spawnLocation.y)
      }
    }
  },
  onWorldReady: async ({ api }) => {
    await api.showSpeech([
      {
        message: `The winding path from the village opens into a large clearing filled with ice-blue flowers.
              The sickly-sweet smell of decaying fall leaves is thick in the air here.`,
      },
      {
        message: `The clearing itself is quiet,      but you can hear the sound 
of running water somewhere off to the north.`,
      },
    ])
  },
}
