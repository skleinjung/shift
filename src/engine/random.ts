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
