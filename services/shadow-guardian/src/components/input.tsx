import { component } from '../utilities/component.tsx'
import { isKey } from '../utilities/is-key.ts'
import { Fragment, h } from '../utilities/jsx-runtime.ts'

export const Input = component('x-input', ({ label, default: defaultValue }, use) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isKey(event, 'enter')) {
      event.preventDefault()
      use.dispatch('submit')
    }
  }

  const handleChange = (event: InputEvent) => {
    use.dispatch('change', (event.target as HTMLDivElement).textContent)
  }

  return (
    <>
      <span class='x-input-label'>{label}</span>
      <div
        contentEditable='true'
        class='x-input'
        on:keydown={handleKeyDown}
        on:input={handleChange}
      >
        {defaultValue}
      </div>
    </>
  )
})