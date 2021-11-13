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
  private _symbol2IntervalInMs: number

  /** whether we are showing the '_symbol1' or '_symbol2' symbol */
  private _showSymbol1 = true

  /** the number of frames we have been in this state */
  private _since = 0

  constructor (
    _durationInMs: number,
    private _symbol1: Partial<MapSymbol>,
    private _symbol1IntervalInMs: number,
    private _symbol2?: Partial<MapSymbol>,
    symbol2IntervalInMs?: number
  ) {
    super(_durationInMs)

    this._symbol2IntervalInMs = symbol2IntervalInMs ?? this._symbol1IntervalInMs
  }

  protected getOverride (elapsed: number) {
    this._since = this._since + elapsed

    const maxTime = this._showSymbol1
      ? this._symbol1IntervalInMs
      : this._symbol2IntervalInMs

    if (this._since > maxTime) {
      this._since -= maxTime
      this._showSymbol1 = !this._showSymbol1
    }

    return this._showSymbol1 ? this._symbol1 : (this._symbol2 ?? {})
  }
}

export const missed = () => new FlashHighlight(
  100,
  {
    background: 0xffffff,
    color: 0x333333,
  },
  100,
  {},
  0
)

export const damaged = (symbol: string) => new FlashHighlight(
  300,
  {
    color: 0xff0000,
    symbol,
  },
  50,
  {
    symbol,
  },
  100
)
