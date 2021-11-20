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
import { ScriptApi } from './api/script-api'

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
  // game timer
  private _timer = new GameTimer()

  // the currently attached world
  private _world: World

  // script controller, that facilitates communicate between scripts, the UI, and the world
  private _scriptApi: ScriptApi

  /** objective tracker listens to world events, and updates campaign objectives */
  private _objectiveTracker = new ObjectiveTracker()

  // world event handlers
  private _handleTurnBinding = this._handleTurn.bind(this)

  constructor (
    private _campaign: Campaign
  ) {
    super()

    this._world = new World()
    this._scriptApi = new GameController(this, this._world)

    this._timer.addUpdateable(this)
    forEach((objective) => {
      this._objectiveTracker.addObjective(objective)
    }, this._campaign.objectives)

    this._objectiveTracker.on('objectiveProgress', (progress, objective) => {
      forEach((script) => {
        script.onObjectiveProgress?.(progress, objective, this._scriptApi)
      }, this._campaign.scripts)
    })

    this.attach(this._world)
    this._world.initializeFromDungeon(this._campaign.createNextDungeon())

    // initialize the campaign
    forEach((script) => {
      script.initialize?.(this._scriptApi)
    }, this._campaign.scripts)

    // initialize the player
    initializePlayer.initialize?.(this._scriptApi)
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
      script.onTurn?.(this._scriptApi)
    }, this._campaign.scripts)
  }
}
