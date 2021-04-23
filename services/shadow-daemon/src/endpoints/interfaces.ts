import { Router } from 'oak'
import { middleware } from '../utilities/middleware.ts'
import { createInterface, validateInterface } from '../wireguard/interfaces.ts'

export const interfaces = new Router({ prefix: '/interfaces' })

interfaces.post('/', middleware(createInterface, validateInterface))
