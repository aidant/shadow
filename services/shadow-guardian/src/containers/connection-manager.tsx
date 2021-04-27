import { component } from '../utilities/component.tsx'
import { h } from '../utilities/jsx-runtime.ts'
import { Connection } from './connection.tsx'
import { Interfaces } from './interfaces.tsx'
import { configuration } from '../shadow-daemon.ts'

export const ConnectionManager = component('x-connection-manager', (Component) => {
  const connectionElement = <Connection />
  const interfacesElement = <Interfaces />

  configuration.subscribe((config) => {
    if (config) {
      connectionElement.remove()
      if (!Component.contains(interfacesElement)) {
        Component.append(interfacesElement)
      }
    } else {
      interfacesElement.remove()
      if (!Component.contains(connectionElement)) {
        Component.append(connectionElement)
      }
    }
  })
  
  return (
    <slot />
  )
})