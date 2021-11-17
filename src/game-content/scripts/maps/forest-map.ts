import { WorldScript } from 'engine/script-api'
import { random, times } from 'lodash/fp'

export const forestMap: WorldScript = {
  initialize: (environment) => {
    times(() => {
      const x = random(-70, 30)
      const y = random(-100, -90)
      environment.addCreature('thorn_gremlin', x, y)
    }, 3)
  },
}
