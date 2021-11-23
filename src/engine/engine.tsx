import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { TypedEventEmitter } from 'typed-event-emitter'

import { GameController } from './api/game-controller'
import { Updateable } from './types'

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
  // game timer
  private _timer = new GameTimer()

  constructor (private _controller: GameController) {
    super()

    this._timer.addUpdateable(this)
  }

  public start () {
    this._timer.start()
  }

  public stop () {
    this._timer.stop()
  }

  public get paused () {
    return false
  }

  public update (): void {
    this._controller.update()
  }
}
