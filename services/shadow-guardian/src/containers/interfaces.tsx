import { component } from '../utilities/component.tsx'
import { h, Fragment } from '../utilities/jsx-runtime.ts'
import { configuration } from '../shadow-daemon.ts'
import { Create } from './create.tsx'

export const Interfaces = component('x-interfaces', (Component, use) => {
  const host = <h1 slot='title' class='x-hostname'></h1>
  const ulInterfaces = <ul slot='list'></ul>

  Component.append(
    host,
    ulInterfaces
  )

  configuration.subscribe((config) => {
    if (!config) return

    host.textContent = config.metadata.host
    for (let indexInterface = 0; true; indexInterface++) {
      const iface = config.interfaces[indexInterface]
      let liInterface = ulInterfaces.childNodes[indexInterface]
      if (iface) {
        liInterface ??= ulInterfaces.appendChild(<li />)
        const h2 = liInterface.querySelector('h2') || liInterface.appendChild(<h2 class='x-interface' />)
        const ulPeers = liInterface.querySelector('ul') || liInterface.appendChild(<ul class='x-peers-container' />)
        h2.textContent = iface.name
        for (let indexPeer = 0; true; indexPeer++) {
          const peer = iface.peers[indexPeer]
          let liPeer = ulPeers.childNodes[indexPeer]
          if (peer) {
            liPeer ??= ulPeers.appendChild(<li class='x-peer' />)
            const h3 = liPeer.querySelector('h3') || liPeer.appendChild(<h3 class='x-peer-name' />)
            const span = liPeer.querySelector('span') || liPeer.appendChild(<span class='x-peer-ip' />)
            h3.textContent = peer.name
            span.textContent = peer.ip
          } else {
            if (liPeer) liPeer.remove()
            else break
          }
        }
      } else {
        if (liInterface) liInterface.remove()
        else break
      }
    }
  })
  
  return (
    <>
      <slot name='title' />
      <slot name='list' />
      <Create />
    </>
  )
})