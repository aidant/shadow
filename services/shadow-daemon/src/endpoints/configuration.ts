import { Router } from 'oak'
import { middleware } from '../utilities/middleware.ts'
import { getPublicConfiguration } from '../wireguard/configuration.ts'

export const configuration = new Router({ prefix: '/configuration' })

configuration.get('/', middleware(getPublicConfiguration))
