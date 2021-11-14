import { World } from 'engine/world'
import { useContext } from 'react'
import { CampaignContext } from 'ui/context-campaign'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current campaign. Will rerender when the campaign dispatches an 'update' event. */
export const useCampaign = () => {
  const campaign = useContext(CampaignContext)
  if (campaign === undefined) {
    throw new Error('useCampaign called outside of a <CampaignContext.Provider ...>')
  }
  return campaign
}
