import { MoveByAction } from 'engine/actions/move-by'
import { Player } from 'engine/player'
import { Behavior } from 'engine/types'

import { creatureAdjustedCost } from '../ai/path-cost-functions'

/** Special type of behavior where actions are directly controlled by the player. */
export const PlayerBehavior = (player: Player): Behavior => (_, world) => {
  // player is auto-moving?
  if (player.destination !== undefined) {
    const path = world.map.getPath(
      player,
      player.destination,
      { costFunction: creatureAdjustedCost({ ignore: [player], map: world.map }) }
    )

    // if we have a path that consists of more than the start node, move to the next node
    if (path.length > 1) {
      const nextStep = path[1]

      if (world.map.isTraversable(nextStep.x, nextStep.y)) {
        const xDelta = path[1].x - player.x
        const yDelta = path[1].y - player.y

        if (xDelta !== 0 || yDelta !== 0) {
          return new MoveByAction(player, xDelta, yDelta)
        }
      } else {
        world.logMessage('Your path is blocked.')
        player.destination = undefined
        return undefined
      }
    } else {
      // we are finished moving -or- there was no path, return to manual input mode
      player.destination = undefined
    }
  }

  // execute the action set by the player via the UI
  const action = player.nextAction
  player.nextAction = undefined
  return action
}
