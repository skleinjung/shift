export type RgbColor = number

/**
 * Interface for objects that can be displayed on the game map.
 */
export interface MapFeature {
  readonly symbol: string
  readonly color: RgbColor
  readonly background?: RgbColor
}
