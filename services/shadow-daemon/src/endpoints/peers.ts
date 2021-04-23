import { Router } from 'oak'
import { middleware } from '../utilities/middleware.ts'
import { validatePeer } from '../wireguard/peers.ts'
import { createPeer } from '../wireguard/peers.ts'

export const peers = new Router({ prefix: '/interfaces/:interface/peers' })

peers.post('/', middleware((body, { interface: name }) => createPeer(name as string, body), validatePeer))