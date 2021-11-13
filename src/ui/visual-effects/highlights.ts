import { MapSymbol } from 'engine/map/map-symbol'

/**
 * effect to highlight an entity. called with frames since last update and should return the
 * symbol to use for highlighting or null if the effect is complete and should be removed
 */
export type HighlightEffect = {
  /** if true, the effect is complete */
  complete: boolean

  /** gets the duration of this effect, in ms */
  duration: number

  getSymbol: (defaultSymbol: MapSymbol) => MapSymbol
}

abstract class AbstractHighlight implements HighlightEffect {
  private _remainingTime: number
  private _lastTime: number

  constructor (public duration: number) {
    this._remainingTime = duration
    this._lastTime = Date.now()
  }

  public get complete () {
    return this._remainingTime <= 0
  }

  public getSymbol (defaultSymbol: MapSymbol) {
    const now = Date.now()
    const elapsed = now - this._lastTime
    this._remainingTime = this._remainingTime - elapsed
    this._lastTime = now
    return {
      ...defaultSymbol,
      ...this.getOverride(elapsed),
    }
  }

  protected abstract getOverride (elapsed: number): Partial<MapSymbol>
}

export class NewSymbolHighlight extends AbstractHighlight {
  constructor (
    private _symbol: Partial<MapSymbol>,
    durationInMs: number
  ) {
    super(durationInMs)
  }

  protected getOverride () {
    return this._symbol
  }
}

export class FlashHighlight extends AbstractHighlight {
  private _defaultIntervalInMs: number

  /** whether we are showing the 'override' or 'default' symbol */
  private _inOverride = true

  /** the number of frames we have been in this state */
  private _since = 0

  constructor (
    private _override: Partial<MapSymbol>,
    _durationInMs: number,
    private _overrideIntervalInMs: number,
    defaultIntervalInMs?: number
  ) {
    super(_durationInMs)

    this._defaultIntervalInMs = defaultIntervalInMs ?? this._overrideIntervalInMs
  }

  protected getOverride (elapsed: number) {
    this._since = this._since + elapsed

    const maxTime = this._inOverride
      ? this._overrideIntervalInMs
      : this._defaultIntervalInMs

    if (this._since > maxTime) {
      this._since -= maxTime
      this._inOverride = !this._inOverride
    }

    return this._inOverride ? this._override : {}
  }
}

export const missed = () => new FlashHighlight(
  {
    background: 0xffffff,
    symbol: ' ',
  },
  200,
  100,
  100
)

export const damaged = () => new FlashHighlight(
  {
    background: 0xff0000,
  },
  300,
  50,
  100
)
