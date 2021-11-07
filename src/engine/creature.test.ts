import { CreatureTypes } from 'db/creatures'
import { keys } from 'lodash/fp'

import { Creature } from './creature'
import { createWeapon, Item } from './item'
import { ExpeditionMap } from './map'

describe('container', () => {
  const createCreature = () => new Creature(CreatureTypes['player'], 0, 0, new ExpeditionMap())

  describe('equipment', () => {
    test('unequippable item', () => {
      const creature = createCreature()
      const item = new Item({ name: 'test-item' })
      creature.inventory.add(item)

      expect(creature.equip(item)).toBe(false)
      expect(keys(creature.equipment).length).toBe(0)
    })

    test('invalid slot', () => {
      const creature = createCreature()
      const item = createWeapon('test-weapon')
      creature.inventory.add(item)

      expect(creature.equip(item, 'Body')).toBe(false)
      expect(keys(creature.equipment).length).toBe(0)
    })

    test('slot already in use', () => {
      const creature = createCreature()
      const item1 = new Item({
        name: 'test-body-item-1',
        equipment: {
          slots: ['Body'],
        },
      })
      const item2 = new Item({
        name: 'test-body-item-2',
        equipment: {
          slots: ['Body'],
        },
      })
      creature.inventory.add(item1)
      creature.inventory.add(item2)

      creature.equip(item1)
      expect(creature.equip(item2)).toBe(false)
      expect(keys(creature.equipment).length).toBe(1)
      expect(creature.equipment.Body?.id).toBe(item1.id)
    })

    test('specific slot', () => {
      const creature = createCreature()
      const item = createWeapon('test-weapon-1')
      creature.inventory.add(item)

      expect(creature.equip(item, 'OffHand')).toBe(true)
      expect(keys(creature.equipment).length).toBe(1)
      expect(creature.equipment.MainHand).toBeUndefined()
      expect(creature.equipment.OffHand?.id).toBe(item.id)
    })

    test('default slot', () => {
      const creature = createCreature()
      const item = createWeapon('test-weapon-1')
      creature.inventory.add(item)

      expect(creature.equip(item)).toBe(true)
      expect(keys(creature.equipment).length).toBe(1)
      expect(creature.equipment.MainHand?.id).toBe(item.id)
    })

    test('default slot, multiple options', () => {
      const creature = createCreature()
      const item1 = createWeapon('test-weapon-1')
      const item2 = createWeapon('test-weapon-2')
      creature.inventory.add(item1)
      creature.inventory.add(item2)

      creature.equip(item1)
      expect(creature.equip(item2)).toBe(true)
      expect(keys(creature.equipment).length).toBe(2)
      expect(creature.equipment.MainHand?.id).toBe(item1.id)
      expect(creature.equipment.OffHand?.id).toBe(item2.id)
    })

    test('item not in inventory', () => {
      const creature = createCreature()
      const item = createWeapon('test-weapon-1')

      expect(creature.equip(item)).toBe(false)
      expect(keys(creature.equipment).length).toBe(0)
    })
  })
})
