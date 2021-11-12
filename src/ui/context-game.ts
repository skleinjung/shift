import { World } from 'engine/world'
import { createContext } from 'react'

export const GameContext = createContext(new World())
