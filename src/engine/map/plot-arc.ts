import { plotSymmetrical, toRadians } from './plot-circle'

const getQuadrant = (xCenter: number, yCenter: number, x: number, y: number) => {
  if (y <= yCenter) {
    return x >= xCenter ? 1 : 2
  } else {
    return x <= xCenter ? 3 : 4
  }
}

const normalizeAngle = (angle: number) => {
  while (angle > 360) {
    angle -= 360
  }
  return angle
}

/**
 * WARNING: this does not work right... if center != origin, or the circle is 'too small' (?)
 */
export const plotArc = (
  xCenter: number,
  yCenter: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  point: (x: number, y: number) => void
) => {
  // this requires both start and end angles to be >= 0; also, it's pointless to have angles over 360 if both are
  while (startAngle > 360 && endAngle > 360) {
    startAngle -= 360
    endAngle -= 360
  }
  while (startAngle < 0 || endAngle < 0) {
    startAngle += 360
    endAngle += 360
  }

  const startXFloat = radius * Math.cos(toRadians(startAngle))
  const startYFloat = -radius * Math.sin(toRadians(startAngle))
  const endXFloat = radius * Math.cos(toRadians(endAngle))
  const endYFloat = -radius * Math.sin(toRadians(endAngle))

  const startX = Math.floor(startXFloat)
  const startY = Math.floor(startYFloat)
  const endX = Math.floor(endXFloat)
  const endY = Math.floor(endYFloat)
  let steps = 500

  const startSlope = Math.round((startYFloat - yCenter) / (startXFloat - xCenter) * 1000) / 1000
  const endSlope = Math.round((endYFloat - yCenter) / (endXFloat - xCenter) * 1000) / 1000

  let x = 0
  let y = radius
  let d = 3 - (2 * radius)

  const isBefore = (
    x: number,
    y: number,
    compareToX: number,
    compareToY: number,
    compareToAngle: number,
    compareToSlope: number
  ) => {
    // check some special cases
    if (compareToAngle % 360 === 0) {
      // if angle is 0, we are never 'before' it
      return false
    } else if (x === xCenter && y < yCenter) {
      // axis between quadrants 1 and 2
      return normalizeAngle(compareToAngle) > 90
    } else if (x === xCenter && y > yCenter) {
      // axis between quadrants 3 and 4
      return normalizeAngle(compareToAngle) > 270
    }

    const compareQuadrant = getQuadrant(xCenter, yCenter, compareToX, compareToY)
    const pointQuadrant = getQuadrant(xCenter, yCenter, x, y)

    const slope = (y - yCenter) / (x - xCenter)

    if (pointQuadrant < compareQuadrant) {
      return true
    } else if (pointQuadrant === compareQuadrant) {
      switch (pointQuadrant) {
        case 1:
          // NE: slope decreasing
          return slope > compareToSlope
        case 2:
          // NW: slope decreasing
          return slope > compareToSlope
        case 3:
          // SW: slope increasing
          return slope > compareToSlope
        case 4:
          // SE: slope increasing
          return slope > compareToSlope
      }
    }

    return false
  }

  const isAfter = (
    x: number,
    y: number,
    compareToX: number,
    compareToY: number,
    compareToAngle: number,
    compareToSlope: number
  ) => {
    // check some special cases
    if (compareToAngle % 360 === 0) {
      // if ending at 360, we are never 'after' start
      return false
    } else if (x === xCenter && y < yCenter) {
      // axis between quadrants 1 and 2
      return normalizeAngle(compareToAngle) < 90
    } else if (x === xCenter && y > yCenter) {
      // axis between quadrants 3 and 4
      return normalizeAngle(compareToAngle) < 270
    }

    const compareQuadrant = getQuadrant(xCenter, yCenter, compareToX, compareToY)
    const pointQuadrant = getQuadrant(xCenter, yCenter, x, y)

    const slope = (y - yCenter) / (x - xCenter)

    if (pointQuadrant > compareQuadrant) {
      return true
    } else if (pointQuadrant === compareQuadrant) {
      switch (pointQuadrant) {
        case 1:
          // NE: slope decreasing
          return slope < compareToSlope
        case 2:
          // NW: slope decreasing
          return slope < compareToSlope
        case 3:
          // SW: slope increasing
          return slope < compareToSlope
        case 4:
          // SE: slope increasing
          return slope < compareToSlope
      }
    }

    return false
  }

  const shouldPlot = (x: number, y: number) => {
    // check if we are inside our arc, including special handling to render the first point as last
    // if our arc ends at an angle that's a multiple of 360

    const started = endAngle > 360
      ? true
      : !isBefore(x, y, startX, startY, startAngle, startSlope)

    const ended = endAngle > 360
      ? isBefore(x, y, startX, startY, startAngle, startSlope) && isAfter(x, y, endX, endY, endAngle, endSlope)
      : isAfter(x, y, endX, endY, endAngle, endSlope)

    return started && !ended
  }

  const maybePlot = (x: number, y: number) => {
    if (shouldPlot(x, y)) {
      point(x, y)
    }
  }

  while (y >= x && steps-- > 0) {
    plotSymmetrical(xCenter, yCenter, x, y, maybePlot)

    x = x + 1

    if (d < 0) {
      d = d + (4 * x) + 6
    } else {
      d = d + 4 * (x - y) + 10
      y = y - 1
    }
  }
}
