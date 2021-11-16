import { findIndex } from 'lodash/fp'

import { Item } from './item'

/**
 * A Container has the ability to store other items.
 */
export interface Container {
  /**
   * Store an item in this container. Returns true if the item was stored successfully,
   * or false if it could not be stored. (Too large, container is full, container is incapable
   * of holding that item, etc.)
   **/
  addItem: (item: Item) => boolean

  /**
   * Remove an item from this container, if it existed.
   */
  removeItem: (item: Item) => void

  /** Returns true if the specified item is in this container. */
  containsItem: (item: Item) => void

  /** The contents of this container, as a readonly array */
  items: Readonly<Item[]>
}

/** Container implementation with no other functionality */
export class BasicContainer implements Container {
  private _contents: Item[] = []

  /**
   * Store an item in this container. Returns true if the item was stored successfully,
   * or false if it could not be stored. (Too large, container is full, container is incapable
   * of holding that item, etc.)
   *
   * If the item was already in another container, it will be removed from that container as part
   * of this call.
   **/
  public addItem (item: Item): boolean {
    if (item.container !== undefined) {
      item.container.removeItem(item)
    }

    this._contents.push(item)
    item.container = this

    return true
  }

  /**
   * Remove an item from this container, if it existed.
   */
  public removeItem (item: Item) {
    const index = findIndex((containedItem) => containedItem.id === item.id, this._contents)
    if (index > -1) {
      this._contents.splice(index, 1)
    }
  }

  /** Returns true if the specified item is in this container. */
  public containsItem (item: Item) {
    return findIndex((candidate) => candidate.id === item.id, this._contents) !== -1
  }

  /** The contents of this container, as a readonly array */
  public get items (): Readonly<Item[]> {
    return this._contents
  }
}
