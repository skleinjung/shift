import { reverse } from 'lodash/fp'

import { plotLine } from './plot-line'

/** Casts a ray from pStart to pEnd, and returns an array containing all points along it. */
export const castRay = (
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
): { x: number; y: number}[] => {
  const result: { x: number; y: number}[] = []
  plotLine(xStart, yStart, xEnd, yEnd, (x, y) => result.push({ x, y }))

  // line drawing algorithm returns result in an unspecified order (start->end or end->start),
  // so we check which we got and reverse it if needed, so that rays are always cast start->end
  return result[0].x === xStart && result[0].y === yStart ? result : reverse(result)
}
