import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { Speech, Vignette } from 'engine/vignette'
import { World } from 'engine/world'
import { forEach, map } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { Objective } from './objective'

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

/** The engine is responsible for triggering vignettes, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements ScriptContext, Updateable {
  // game timer
  private _timer = new GameTimer()

  // the currently attached world
  private _world: World

  // currently active vignette, if any
  private _vignette: Vignette | undefined
  private _handleVignetteComplete = this._onVignetteComplete.bind(this)

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

  public get vignette () {
    return this._vignette
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
    this.playVignette(new Vignette(map((speechLine) => ({
      speech: speechLine,
      type: 'speech',
    }), speech)))
  }

  public playVignette (vignette: Vignette) {
    if (this._vignette !== undefined) {
      this.emit('vignetteComplete', this._vignette)
      this._onVignetteComplete(this._vignette)
    }

    this._vignette = vignette

    this.emit('vignette', this._vignette)
    this._world.paused = true
    this._vignette.on('complete', this._handleVignetteComplete)
  }

  private _onVignetteComplete (vignette: Vignette) {
    this._vignette = undefined
    this.emit('vignetteComplete', vignette)
    this._world.paused = false
  }

  /** detaches the current world in preparation for a new one */
  private _detach () {
    if (this._world !== undefined) {
      this._timer.removeUpdateable(this._world)
      this._objectiveTracker.detach()
    }
  }
}
