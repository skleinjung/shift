const plotLineLow = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  point: (x: number, y: number) => void
) => {
  const dx = x1 - x0
  let dy = y1 - y0
  let yi = 1
  if (dy < 0) {
    yi = -1
    dy = -dy
  }

  let D = (2 * dy) - dx
  let y = y0

  for (let x = x0; x <= x1; x++) {
    point(x, y)

    if (D > 0) {
      y = y + yi
      D = D + (2 * (dy - dx))
    } else {
      D = D + 2 * dy
    }
  }
}

const plotLineHigh = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  point: (x: number, y: number) => void
) => {
  let dx = x1 - x0
  const dy = y1 - y0
  let xi = 1
  if (dx < 0) {
    xi = -1
    dx = -dx
  }

  let D = (2 * dx) - dy
  let x = x0

  for (let y = y0; y <= y1; y++) {
    point(x, y)

    if (D > 0) {
      x = x + xi
      D = D + (2 * (dx - dy))
    } else {
      D = D + 2 * dx
    }
  }
}

/**
 * Plots a line using Bresenham's line algorithm. For each point along the line, the 'point' callback
 * is called with the (x, y) coordinate of the point. Note that this implementation is directly lifted and
 * shifted from the pseudo-code on Wikipedia for this algorithm.
 *
 * @see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
 */
export const plotLine = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  point: (x: number, y: number) => void
) => {
  if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
    if (x0 > x1) {
      plotLineLow(x1, y1, x0, y0, point)
    } else {
      plotLineLow(x0, y0, x1, y1, point)
    }
  } else {
    if (y0 > y1) {
      plotLineHigh(x1, y1, x0, y0, point)
    } else {
      plotLineHigh(x0, y0, x1, y1, point)
    }
  }
}
