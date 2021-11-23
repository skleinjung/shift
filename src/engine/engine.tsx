import { EngineEvents } from 'engine/events'
import { GameTimer } from 'engine/game-timer'
import { split } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { GameController } from './api/game-controller'
import { Commands } from './commands'
import { Updateable } from './types'

/** The engine is responsible for triggering speech, scripted events, updating quests, etc. */
export class Engine extends TypedEventEmitter<EngineEvents> implements Updateable {
  // game timer
  private _timer = new GameTimer()

  constructor (private _controller: GameController) {
    super()

    this._timer.addUpdateable(this)
  }

  /** Executes a given player command string */
  public executeCommand (commanString: string) {
    this._controller.world.logMessage(`> ${commanString}`)

    const [commandName, ...commandArgs] = split(' ', commanString)

    const command = Commands[commandName]
    if (command !== undefined) {
      command.execute(commandArgs, this._controller.world)
    } else {
      this._controller.world.logMessage('Unrecognized command. (Try "help")')
    }
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
