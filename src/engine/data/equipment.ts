export const BodyEquipment = [
  {
    id: 'leather_armor',
    name: 'leather armor',
    description: 'This smells like genuine leather.',
    slots: 'Body',
    modifiers: {
      modifyDefense: 1,
    },
  },
] as const

export const FeetEquipment = [
  {
    id: 'leather_boots',
    name: 'leather boots',
    description: "They don't offer much protection, but at least your feet will stay dry.",
    slots: 'Feet',
  },
] as const

export const FingerEquipment = [
  {
    id: 'ring_of_protection',
    name: 'ring of protection',
    description: 'This ring feels heavier than it should.',
    slots: 'Finger',
    modifiers: {
      modifyDefense: 1,
    },
  },
] as const

export const HandsEquipment = [
  {
    id: 'soft_leather_gloves',
    name: 'soft leather gloves',
    description: "They don't offer much protection, but at least your hands will stay dry.",
    slots: 'Hands',
  },
] as const

export const HeadEquipment = [
  {
    id: 'gold_circlet',
    name: 'golden circlet',
    description: 'Just thinking about wearing this makes you feel fancy.',
    slots: 'Head',
    modifiers: {
      modifyHealthMax: 5,
    },
  },
] as const

export const MainHandEquipment = [
  {
    id: 'dagger',
    name: 'dagger',
    description: 'Small but mighty.',
    slots: 'MainHand',
    modifiers: {
      modifyMelee: 1,
    },
  },
  {
    id: 'spear',
    name: 'spear',
    description: 'Stab things with the pointy end.',
    slots: 'MainHand',
    modifiers: {
      modifyMelee: 2,
    },
  },
  {
    id: 'glowing_spear',
    name: 'glowing spear',
    description: 'Stab things with the (glowing) pointy end.',
    slots: 'MainHand',
    modifiers: {
      modifyMelee: 3,
    },
  },
] as const

export const NeckEquipment = [
  {
    id: 'necrotic_amulet',
    name: 'necrotic amulet',
    description: 'This amulet is cold to the touch, and makes your skin crawl.',
    slots: 'Neck',
    modifiers: {
      modifyHealthMax: -5,
    },
  },
] as const

export const OffHandEquipment = [
  {
    id: 'wooden_buckler',
    name: 'wooden buckler',
    description: "It's pretty small, but still better than nothing.",
    slots: 'OffHand',
    modifiers: {
      modifyDefense: 1,
    },
  },
] as const

export const WaistEquipment = [
  {
    id: 'girdle_of_punching',
    name: 'girdle of punching',
    description: "Are you the best? Yes, you're the best.",
    slots: 'Waist',
    modifiers: {
      modifyMelee: 1,
    },
  },
] as const

export const EquipmentData = [
  ...BodyEquipment,
  ...FeetEquipment,
  ...FingerEquipment,
  ...HandsEquipment,
  ...HeadEquipment,
  ...MainHandEquipment,
  ...NeckEquipment,
  ...OffHandEquipment,
  ...WaistEquipment,
] as const
