import { find } from 'lodash/fp'

import { BasicContainer, Container } from './container'
import { Item } from './item'

describe('BasicContainer', () => {
  const createContainer = () => new BasicContainer()
  const createItem = () => new Item({ name: 'test-object' })

  let container: Container
  let object1: Item
  let object2: Item

  beforeEach(() => {
    container = createContainer()
    object1 = createItem()
    object2 = createItem()
  })

  describe('add', () => {
    test('returns true', () => {
      expect(container.addItem(object1)).toBe(true)
      expect(container.addItem(object2)).toBe(true)
    })

    test('adds item to contents', () => {
      container.addItem(object1)
      container.addItem(object2)

      expect(container.items.length).toBe(2)
      expect(find((item) => item.id === object1.id, container.items)).toBeDefined()
      expect(find((item) => item.id === object2.id, container.items)).toBeDefined()
    })
  })

  describe('remove', () => {
    test('removes item from container', () => {
      // add two items
      container.addItem(object1)
      container.addItem(object2)

      // remove one of them
      container.removeItem(object1)

      // assert only one remains
      expect(container.items.length).toBe(1)
      expect(find((item) => item.id === object1.id, container.items)).toBeUndefined()
      expect(find((item) => item.id === object2.id, container.items)).toBeDefined()
    })
  })

  describe('contains', () => {
    test('true', () => {
      container.addItem(object1)
      expect(container.containsItem(object1)).toBe(true)
    })

    test('false', () => {
      expect(container.containsItem(object1)).toBe(false)
    })
  })
})
