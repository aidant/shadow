import { component } from '../utilities/component.tsx'
import { h } from '../utilities/jsx-runtime.ts'

export const Card = component('x-card', (instance) => {
  return (
    <div class='card'>
      <slot />
    </div>
  )
})