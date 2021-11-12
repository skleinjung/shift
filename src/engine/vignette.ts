/** A single step in the scripted sequence of a vignette. */
export type VignetteStep = () => void

/**
 * A vignette is a scripted scene that conveys the story. It consists of events like dialog, map panning,
 * world changes, etc. When played, a vignette will execute one or more VignetteSteps in sequence.
 */
export class Vignette {
  private _steps: VignetteStep[] = []

  /** Plays this vignette. */
  public play () {
    // noop
  }
}
