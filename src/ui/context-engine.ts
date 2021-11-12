import { Campaign } from 'engine/campaign'
import { createContext } from 'react'

import { Engine } from '../engine/engine'

export const EngineContext = createContext<Engine>(new Engine(new Campaign()))
