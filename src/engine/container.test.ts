import { find } from 'lodash/fp'

import { Container } from './container'
import { Item } from './item'

describe('container', () => {
  const createContainer = () => new Container('test-container')
  const createItem = () => new Item('test-object')

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
      expect(container.add(object1)).toBe(true)
      expect(container.add(object2)).toBe(true)
    })

    test('adds item to contents', () => {
      container.add(object1)
      container.add(object2)

      expect(container.contents.length).toBe(2)
      expect(find((item) => item.id === object1.id, container.contents)).toBeDefined()
      expect(find((item) => item.id === object2.id, container.contents)).toBeDefined()
    })
  })

  describe('remove', () => {
    test('removes item from container', () => {
      // add two items
      container.add(object1)
      container.add(object2)

      // remove one of them
      container.remove(object1)

      // assert only one remains
      expect(container.contents.length).toBe(1)
      expect(find((item) => item.id === object1.id, container.contents)).toBeUndefined()
      expect(find((item) => item.id === object2.id, container.contents)).toBeDefined()
    })
  })
})
