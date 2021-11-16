import { forEach, without } from 'lodash/fp'

import { Updateable } from './types'

const UPDATES_PER_SECOND = 30

export class GameTimer {
  // data used to control the timer loop
  private _previousTurnTime = 0
  private _running = false

  private _updateables: Updateable[] = []

  public addUpdateable (updateable: Updateable) {
    this._updateables.push(updateable)
  }

  public removeUpdateable (updateable: Updateable) {
    this._updateables = without([updateable], this._updateables)
  }

  public start () {
    if (!this._running) {
      this._previousTurnTime = 0
      this._running = true
      window.requestAnimationFrame(this._onTimer.bind(this))
    }
  }

  public stop () {
    this._running = false
  }

  private _onTimer (timestamp: number) {
    const msPerTurn = 1000 / UPDATES_PER_SECOND

    if ((timestamp - this._previousTurnTime) > msPerTurn) {
      forEach((updateable) => {
        if (!updateable.paused) {
          updateable.update()
        }
      }, this._updateables)

      this._previousTurnTime = timestamp
    }

    if (this._running) {
      window.requestAnimationFrame(this._onTimer.bind(this))
    }
  }
}
