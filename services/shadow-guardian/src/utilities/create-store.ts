export type Subscription<T = unknown> = (state: T) => void 
export type Updater<T = unknown> = (state: T) => T

export interface Readable<T> {
  get (): T
  subscribe (subscription: Subscription<T>): () => void
}

export interface Writable<T> extends Readable<T> {
  set (state: T, force?: boolean): T
  update (updater: Updater<T>): T
}

export const createStore = <T> (state: T): Writable<T> => {
  const subscriptions = new Set<Subscription<T>>()

  const get = () => {
    return state
  }

  const set = (newState: T, force?: boolean): T => {
    if (!force && state === newState) return state
    state = newState
    subscriptions.forEach(subscription => subscription(state))
    return state
  }

  const update = (updater: Updater<T>): T => {
    return set(updater(get()))
  }

  const subscribe = (subscription: Subscription<T>) => {
    subscriptions.add(subscription)
    subscription(state)
    return () => subscriptions.delete(subscription)
  }

  return { get, set, update, subscribe }
}
