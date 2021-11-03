/* eslint-disable max-len */
import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { endTurn as endExpeditionTurn, expeditionState } from 'state/expedition'
import { useModel } from 'state/hooks'
import { dealDamage, endTurn, isExpeditionComplete, playerState } from 'state/player'

import { ScreenName } from './app'
import { MapPanel } from './map-panel-pixi'
import { Panel } from './panel'
import { PreFormattedText } from './pre-formatted-text'

import './expedition-screen.css'

const SidebarColumns = 30

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const isComplete = useRecoilValue(isExpeditionComplete)
  const player = useModel(playerState)
  const expedition = useModel(expeditionState)

  useEffect(() => {
    const timeout = setTimeout(() => {
      player.dispatch(endTurn)

      if (Math.random() * 100 < 20) {
        player.dispatch(dealDamage(1))
      }
      expedition.dispatch(endExpeditionTurn)
    }, 100)

    if (isComplete) {
      navigateTo('expedition-ended')
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [expedition, isComplete, navigateTo, player])

  const status = `Health: ${player.health}/${player.healthMax}
Link  : ${player.link}`

  return (
    <div className="dungeon-screen">
      <div className="sidebar">
        <Panel columns={SidebarColumns} rows={3}>
          <PreFormattedText>{status}</PreFormattedText>
        </Panel>

        <Panel columns={SidebarColumns}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>

        <Panel columns={SidebarColumns} rows={10}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>

        <Panel columns={SidebarColumns} rows={5}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>
      </div>

      <div className="main-content">
        <MapPanel />
      </div>
    </div>
  )
}
