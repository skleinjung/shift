import { cltRandom, random } from 'engine/random'

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
