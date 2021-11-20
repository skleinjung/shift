import { Campaign } from 'engine/campaign'
import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { ObjectiveTracker } from 'engine/objective-tracker'
import { Updateable } from 'engine/types'
import { World } from 'engine/world'
import { forEach } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { initializePlayer } from '../game-content/scripts/creatures/player'

import { GameController } from './api/game-controller'

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
  // game timer
  private _timer = new GameTimer()

  // the currently attached world
  private _world: World

  /** objective tracker listens to world events, and updates campaign objectives */
  private _objectiveTracker = new ObjectiveTracker()

  // world event handlers
  private _handleTurnBinding = this._handleTurn.bind(this)

  constructor (
    private _campaign: Campaign,
    private _controller: GameController
  ) {
    super()

    this._world = new World()
    this.attach(this._world)
  }

  public onInitialize () {
    this._timer.addUpdateable(this)
    forEach((objective) => {
      this._objectiveTracker.addObjective(objective)
    }, this._campaign.objectives)

    this._objectiveTracker.on('objectiveProgress', (progress, objective) => {
      forEach((script) => {
        script.onObjectiveProgress?.(progress, objective, this._controller)
      }, this._campaign.scripts)
    })

    this._world.initializeFromDungeon(this._campaign.createNextDungeon())

    // initialize the campaign
    forEach((script) => {
      script.onInitialize?.(this._controller)
    }, this._campaign.scripts)

    // initialize the player
    initializePlayer.onInitialize?.(this._controller)
  }

  /** Called once the UI is ready and listening for events or commands. */
  public onUiReady () {
    // notify any campaign scripts that the UI is visible
    forEach((script) => {
      script.onUiReady?.(this._controller)
    }, this._campaign.scripts)
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

    // attach our listeners
    this._world.on('turn', this._handleTurnBinding)
  }

  /** the engine never sleeps */
  public get paused () {
    return false
  }

  public update () {
    // noop
  }

  /** detaches the current world in preparation for a new one */
  private _detach () {
    if (this._world !== undefined) {
      this._timer.removeUpdateable(this._world)
      this._objectiveTracker.detach()
    }
  }

  private _handleTurn () {
    forEach((script) => {
      script.onTurn?.(this._controller)
    }, this._campaign.scripts)
  }
}
