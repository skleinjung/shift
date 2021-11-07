/** quasi-normal value without fancy math, leveraging central limit theorem */
export const cltRandom = () => {
  let rand = 0

  for (let i = 0; i < 6; i += 1) {
    rand += Math.random()
  }

  return rand / 6
}

/** generates a random number in a specified range, optionally using a specific PRNG */
export const random = (minimum: number, maximum: number, rng = Math.random) => {
  return Math.floor(rng() * (maximum - minimum + 1) + minimum)
}

/**
 * Generates room dimensions with a specified range of Area values, using a normal distribution.
 * The roomIrregularity value determines how square the room shapes will be. Using zero will generate
 * approximately perfect squares, and larger values will potentially be thinner rectangles.
 **/
export const generateRoomDimensions = ({
  maximumRoomArea,
  minimumRoomArea,
  roomIrregularity,
}: { maximumRoomArea: number; minimumRoomArea: number; roomIrregularity: number }) => {
  const area = random(minimumRoomArea, maximumRoomArea, cltRandom)

  const wider = random(0, 1) === 0
  const ratio = 1 + (Math.random() * roomIrregularity)
  const ratio1 = wider ? ratio : 1
  const ratio2 = wider ? 1 : ratio

  // http://mathcentral.uregina.ca/QQ/database/QQ.09.15/h/colum1.html
  const height = Math.round(Math.sqrt((area * ratio2) / ratio1))
  const width = Math.round(area / height)

  return {
    width,
    height,
  }
}
