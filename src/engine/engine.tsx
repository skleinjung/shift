import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { World } from 'engine/world'
import { forEach } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { Objective } from './objective'

/** A single piece of content that should be displayed during a dialog 'cutscene'. */
export interface Speech {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

export interface ScriptContext {
  /** gets the world associated with the current expedition */
  world: World

  /**
   * Show the supplied speech content to the user.
   * TODO: determine when it's done, so scripts can do more...
   */
  showSpeech: (speech: Speech[]) => void
}

/**
 * A script is a piece of automation that can be inserted into the normal game flow, to display
 * dialog, pan the map to interesting areas, etc. The script interface exposes a number of event
 * handlers that are called by the engine whenever the relevant event occurs.
 */
export interface Script {
  onObjectiveProgress: (progress: number, objective: Objective, context: ScriptContext) => void
}

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements ScriptContext, Updateable {
  // game timer
  private _timer = new GameTimer()

  // the currently attached world
  private _world: World

  /** objective tracker listens to world events, and updates campaign objectives */
  private _objectiveTracker = new ObjectiveTracker()

  constructor (
    private _campaign: Campaign
  ) {
    super()

    this._timer.addUpdateable(this)
    forEach((objective) => {
      this._objectiveTracker.addObjective(objective)
    }, this._campaign.objectives)

    this._objectiveTracker.on('objectiveProgress', (progress, objective) => {
      forEach((script) => {
        script.onObjectiveProgress(progress, objective, this)
      }, this._campaign.scripts)
    })

    this._world = new World()
    this.attach(this._world)
  }

  public get world () {
    return this._world
  }

  public start () {
    this._timer.start()
  }

  public stop () {
    this._timer.stop()
  }

  /** attaches this objective tracker to a world */
  public attach (world: World) {
    this._detach()
    this._world = world

    this._objectiveTracker.attach(world)
    this._timer.addUpdateable(world)
  }

  /** the engine never sleeps */
  public get paused () {
    return false
  }

  public update () {
    // no nothing currently
  }

  public showSpeech (speech: Speech[]) {
    this.emit('speech', speech)
  }

  /** detaches the current world in preparation for a new one */
  private _detach () {
    if (this._world !== undefined) {
      this._timer.removeUpdateable(this._world)
      this._objectiveTracker.detach()
    }
  }
}
