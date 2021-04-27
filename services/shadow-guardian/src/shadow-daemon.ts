import { createStore } from './utilities/create-store.ts'
import { PublicConfiguration, CreatePeerDescriptor, Interface } from '@shadow/tools/types.ts'
import { createKeyPair } from '@shadow/tools/curve25519.ts'

export const address = createStore('10.0.0.1')
export const configuration = createStore<PublicConfiguration | null>(null)

const api = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(`//${address.get()}${path}`, init).then(response => {
    if (response.ok) {
      return response
    } else {
      throw new Error(`Request failed with status code: "${response.status}".`)
    }
  })
}

let configurationAbortController = new AbortController()
export const loadConfiguration = async () => {
  configurationAbortController.abort()
  configurationAbortController = new AbortController()

  const response = await api('/api/configuration', { signal: configurationAbortController.signal })
    .then(response => response.json())

  configuration.set(response)
}
address.subscribe(loadConfiguration)

//@ts-ignore
globalThis.loadConfiguration = loadConfiguration

export const createInterface = async (payload: Interface): Promise<void> => {
  await api('/api/interfaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; encoding=utf-8'
    },
    body: JSON.stringify(payload)
  })
  await loadConfiguration()
}

export const createPeer = async (
  interfaceName: string,
  peerName: string
): Promise<string> => {
  const { privateKey, presharedKey, publicKey } = createKeyPair()

  const payload: CreatePeerDescriptor = {
    name: peerName,
    publicKey,
    presharedKey,
  }
  
  const configuration = await api(`/api/interfaces/${interfaceName}/peers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; encoding=utf-8'
    },
    body: JSON.stringify(payload)
  }).then(response => response.json())

  await loadConfiguration()

  return configuration.replace('PRIVATE_KEY', privateKey)
}