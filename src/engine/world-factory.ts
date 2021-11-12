import { forEach } from 'lodash/fp'

import { Campaign } from './campaign'
import { ObjectiveTracker } from './objective-tracker'
import { World } from './world'

/** Creates a world for a new expedition in the specified campaign. */
export const createWorld = (campaign: Campaign) => {
  const world = new World()

  const tracker = new ObjectiveTracker()
  forEach((objective) => tracker.addObjective(objective), campaign.objectives)
  tracker.attach(world)

  return world
}
