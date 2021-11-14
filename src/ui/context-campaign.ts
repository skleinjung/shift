import { Campaign } from 'engine/campaign'
import { createContext } from 'react'

export const CampaignContext = createContext<Campaign | undefined>(undefined)
