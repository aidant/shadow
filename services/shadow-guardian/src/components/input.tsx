import { component } from '../utilities/component.tsx'
import { h } from '../utilities/jsx-runtime.ts'

export const Input = component('x-input', (instance) => {
  const internals = instance.attachInternals()

  console.log(internals)

  return (
    <input />
  )
})