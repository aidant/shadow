import { component } from '../utilities/component.tsx'
import { h } from '../utilities/jsx-runtime.ts'

export const Button = component('x-button', (instance) => {
  return (
    <button><slot /></button>
  )
})