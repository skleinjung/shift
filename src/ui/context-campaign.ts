import { Campaign, DemoCampaign } from 'engine/campaign'
import { createContext } from 'react'

export const CampaignContext = createContext<Campaign>(new DemoCampaign())
