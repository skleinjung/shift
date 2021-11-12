import { castArray, join } from 'lodash/fp'

export type WithExtraClasses = {
  /** additional CSS classes to apply */
  classes?: string | string[]
}

/**
 * Creates a standard `className` attribute by combining optional extra classes (as an array or single
 * string) with an optional set of fixed, static classes.
 */
export const toClassName = (extraClasses: string | string[] | undefined, ...staticClasses: string[]) => {
  return join(' ', [...staticClasses, ...castArray(extraClasses)])
}
