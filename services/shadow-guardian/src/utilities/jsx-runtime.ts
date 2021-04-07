import { CustomComponent } from './component.tsx'

type Component = string | typeof Element
type Child = string | Node
type Props = Record<string, unknown>
type PropsWithChildren <T extends Props = Props> = T & { children?: Child | Child[] }

declare global {
  namespace JSX {
    type IntrinsicElements = {
      [P in keyof HTMLElementTagNameMap]: Partial<Omit<HTMLElementTagNameMap[P], 'addEventListener' | 'removeEventListener'>> & { 
        'x:ref'?: (element: HTMLElementTagNameMap[P]) => void
        class?: string
      }
    }
  }
}

const setProp = (element: Element, property: string, value: unknown) => {
  if (property in element || element instanceof CustomComponent) {
    // @ts-ignore
    element[property] = value
  } else if (value == null) {
    element.removeAttribute(property)
  } else {
    element.setAttribute(property, value as string)
  }
}

const setChildren = (element: ParentNode, children?: Child | Child[]) => {
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child) {
        element.append(child)
      }
    }
  } else if (children) {
    element.append(children)
  }
}

export const jsx = (component: Component, { 'x:ref': ref, children, ...props }: PropsWithChildren = {}) => {
  const element = typeof component === 'string'
    ? document.createElement(component)
    : new component()

  setChildren(element, children)

  if (typeof ref === 'function') {
    ref(element)
  }

  for (const property in props) {
    const value = props[property]
    if (property.startsWith('on:')) {
      const event = property.replace(/^on:/, '')
      element.addEventListener(event, value as () => void)
    } else {
      setProp(element, property, value)
    }
  }

  return element
}

export const h = (component: Component, props: Props = {}, ...children: Child[]) => jsx(component, { ...props, children })

export const Fragment = ({ children }: PropsWithChildren = {}) => {
  const element = document.createDocumentFragment()

  setChildren(element, children)

  return element
}