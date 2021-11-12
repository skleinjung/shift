import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { Vignette } from 'engine/vignette'
import { World } from 'engine/world'
import { forEach } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

/** The engine is responsible for triggering vignettes, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
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
