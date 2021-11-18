export const plotSymmetrical = (
  xCenter: number,
  yCenter: number,
  x: number,
  y: number,
  point: (x: number, y: number) => void
) => {
  // octant 1
  point(xCenter + y, yCenter - x)
  // octant 2
  point(xCenter + x, yCenter - y)
  // octant 3
  point(xCenter - x, yCenter - y)
  // octant 4
  point(xCenter - y, yCenter - x)
  // octant 5
  point(xCenter - y, yCenter + x)
  // octant 6
  point(xCenter - x, yCenter + y)
  // octant 7
  point(xCenter + x, yCenter + y)
  // octant 8
  point(xCenter + y, yCenter + x)
}

export const toRadians = (degrees: number) => degrees * (Math.PI / 180)

export const plotCircle = (
  xCenter: number,
  yCenter: number,
  radius: number,
  point: (x: number, y: number) => void
) => {
  // noop

  let x = 0
  let y = radius
  let d = 3 - (2 * radius)
  let steps = 500
  while (y >= x && steps-- > 0) {
    plotSymmetrical(xCenter, yCenter, x, y, point)

    x = x + 1

    if (d < 0) {
      d = d + (4 * x) + 6
    } else {
      d = d + 4 * (x - y) + 10
      y = y - 1
    }
  }
}
