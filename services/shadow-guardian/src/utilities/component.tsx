import { h } from './jsx-runtime.ts'

export class CustomComponent extends HTMLElement {}

interface Use {
  dispatch(name: string, event?: unknown | Event): void
}

type Render = (instance: CustomComponent & Record<string, any>, use: Use) => Node

export const component = (name: string, render: Render) => {
  const constructor = class extends CustomComponent {
    shadowRoot = this.attachShadow({ mode: 'closed' })

    constructor() {
      super()
      this.shadowRoot.append(
        <link href='style.css' rel='stylesheet' />,
      )
    }

    connectedCallback () {
      const use: Use = {
        dispatch: (name, data) => {
          const event = data instanceof Event ? data : new CustomEvent(name, { detail: data })
          this.dispatchEvent(event)
        }
      }
      
      this.shadowRoot.append(
        render(this, use)
      )
    }
  }

  customElements.define(name, constructor)

  return constructor
}