import { findIndex } from 'lodash/fp'

import { Item } from './item'

/**
 * A Container is an item with the ability to store other items.
 */
export class Container extends Item {
  private _contents: Item[] = []

  /**
   * Store an item in this container. Returns true if the item was stored successfully,
   * or false if it could not be stored. (Too large, container is full, container is incapable
   * of holding that item, etc.)
   **/
  public add (item: Item): boolean {
    this._contents.push(item)
    return true
  }

  /**
   * Remove an item from this container, if it existed.
   */
  public remove (item: Item) {
    const index = findIndex((containedItem) => containedItem.id === item.id, this._contents)
    if (index > -1) {
      this._contents.splice(index, 1)
    }
  }

  /** The contents of this container, as a readonly array */
  public get contents (): Readonly<Item[]> {
    return this._contents
  }
}
