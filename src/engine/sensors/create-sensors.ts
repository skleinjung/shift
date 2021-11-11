import { Creature } from 'engine/creature'

import { LastAggressorSensor } from './last-aggressor'

export const createSensors = (creature: Creature) => ({
  lastAggressor: new LastAggressorSensor(creature),
})
