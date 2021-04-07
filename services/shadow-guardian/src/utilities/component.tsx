import { h } from './jsx-runtime.ts'

export class CustomComponent extends HTMLElement {}

type Render = (instance: CustomComponent & Record<string, any>) => Node

export const component = (name: string, render: Render) => {
  const constructor = class extends CustomComponent {
    #root = this.attachShadow({ mode: 'closed' })

    constructor() {
      super()
      this.#root.append(
        <link href='style.css' rel='stylesheet' />,
      )
    }

    connectedCallback () {
      this.#root.append(
        render(this)
      )
    }
  }

  customElements.define(name, constructor)

  return constructor
}