export type RgbColor = number

export interface Renderable {
  readonly symbol: string
  readonly color: RgbColor
  readonly background?: RgbColor
}
