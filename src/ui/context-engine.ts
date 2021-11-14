import { createContext } from 'react'

import { Engine } from '../engine/engine'

export const EngineContext = createContext<Engine | undefined>(undefined)
