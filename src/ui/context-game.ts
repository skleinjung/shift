import { GameController } from 'engine/api/game-controller'
import { createContext } from 'react'

export const GameControllerContext = createContext<GameController | undefined>(undefined)
