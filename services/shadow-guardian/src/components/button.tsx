import { component } from '../utilities/component.tsx'
import { isKey } from '../utilities/is-key.ts'
import { h } from '../utilities/jsx-runtime.ts'

export const Button = component('x-button', (Component, use) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      isKey(event, 'enter') ||
      isKey(event, 'space')
    ) {
      event.preventDefault()
      use.dispatch('submit')
    }
  }

  const handleClick = (event: MouseEvent) => {
    use.dispatch('submit')
  }
  
  ;// @ts-ignore
  <Component
    tabIndex='0'
    on:keydown={handleKeyDown}
    on:click={handleClick}
  />

  return (
    <slot class='x-button' part='x-button' />
  )
})