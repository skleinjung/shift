import { Creature } from 'engine/creature'
import { CreatureTypes } from 'engine/creature-db'
import { random } from 'engine/random'
import { times } from 'lodash/fp'

import { StaticDungeon } from './static-dungeon'

export const createForest = () => {
  const dungeon = new StaticDungeon('forest')

  const isValidSpawnPoint = (x: number, y: number) => {
    return dungeon.getCreature(x, y) === undefined && dungeon.getTerrain(x, y)?.traversable
  }

  times(() => {
    let attempt = 0
    let success = false
    while (!success && attempt++ < 50) {
      const x = random(dungeon.left, dungeon.right)
      const y = random(dungeon.top, dungeon.bottom)

      if (isValidSpawnPoint(x, y)) {
        dungeon.creatures.push(new Creature(CreatureTypes.dart_lizard, x, y))
        success = true
      }
    }
  }, random(2, 3))

  return dungeon
}
