import { MapCell } from './map'
import { MapSymbol } from './map-symbol'
import { CreatureSymbols, ItemSymbols, TerrainSymbols } from './map-symbol-set'

/**
 * Returns a symbol with the terrain's background applied, if the entity symbol's own background
 * is undefined.
 */
export const withDefaultBackground = (cell: MapCell, entitySymbol: MapSymbol) => {
  if (entitySymbol.background !== undefined) {
    return entitySymbol
  }

  return {
    ...entitySymbol,
    background: TerrainSymbols[cell.terrain.id]?.background ?? TerrainSymbols.default.background,
  }
}

/** Gets the symbol for any entity in the map cell, or undefined if none. */
const getEntitySymbol = (cell: MapCell | undefined): MapSymbol | undefined => {
  if (cell?.creature !== undefined) {
    const creatureSymbol = CreatureSymbols[cell.creature.type.id]
    if (creatureSymbol === undefined) {
      return CreatureSymbols.default
    }

    return creatureSymbol
  }
  if ((cell?.items?.length ?? 0) > 1) {
    return ItemSymbols.multiple
  } else if ((cell?.items?.length ?? 0) > 0) {
    return ItemSymbols.default
  }

  return undefined
}

/** Returns the MapSymbol that should be used to render a specified cell. */
export const toSymbol = (cell: MapCell | undefined): MapSymbol => {
  const entitySymbol = getEntitySymbol(cell)
  if (cell !== undefined && entitySymbol !== undefined) {
    return withDefaultBackground(cell, entitySymbol)
  }

  if (cell?.terrain !== undefined) {
    const terrainSymbol = TerrainSymbols[cell.terrain.id]
    if (terrainSymbol !== undefined) {
      return terrainSymbol
    }
  }

  return TerrainSymbols.default
}
