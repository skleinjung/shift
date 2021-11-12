import { TypedEventEmitter } from 'typed-event-emitter'

import { VignetteEvents } from './events'
import { Updateable } from './types'

/** A single piece of content that should be displayed during a dialog 'cutscene'. */
export interface Speech {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

/** A single step in the scripted sequence of a vignette. */
export type VignetteStep = () => void

/**
 * A vignette is a scripted scene that conveys the story. It consists of events like dialog, map panning,
 * world changes, etc. When played, a vignette will execute one or more VignetteSteps in sequence.
 */
export class Vignette extends TypedEventEmitter<VignetteEvents> implements Updateable {
  private _currentStep = 0
  private _dialog = []

  public get speech (): Speech | undefined {
    return this._dialog[this._currentStep]
  }

  public advance () {
    this._currentStep++
    this.emit('advance', this)
    if (this.complete) {
      this.emit('complete', this)
    }
  }

  public get complete () {
    return this._currentStep > this._dialog.length - 1
  }

  public get paused () {
    return false
  }

  public update () {
    // do nothing current
  }
}
