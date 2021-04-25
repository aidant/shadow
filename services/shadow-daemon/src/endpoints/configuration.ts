import { Router } from 'oak'
import { middleware } from '../utilities/middleware.ts'
import { getPublicConfiguration } from '../wireguard/configuration.ts'

export const configuration = new Router({ prefix: '/api/configuration' })

configuration.get('/', middleware(getPublicConfiguration))
