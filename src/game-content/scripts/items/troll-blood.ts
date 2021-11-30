import { Item } from 'engine/item'

export const TROLL_BLOOD_SPLATTER_NAME = 'splatter of troll\'s blood'

export const createTrollBloodSplatter = () => new Item({
  description: `You and your equipment are covered in the blood of a troll. It will take hours
to clean it off, but you suspect the smell of moss and urine will linger for days.`,
  name: TROLL_BLOOD_SPLATTER_NAME,
})
