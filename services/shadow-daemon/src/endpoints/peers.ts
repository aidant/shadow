import { Router } from 'oak'
import { listPeers, createPeer } from '../wireguard/peers.ts'

export const peers = new Router({ prefix: '/interfaces/:interface/peers' })

peers.get('/', (ctx) => {
  ctx.response.body = listPeers(ctx.params.interface as string)
})

peers.post('/:peer', async (ctx) => {
  const body = await ctx.request.body({ type: 'json' }).value
  ctx.response.body = createPeer(ctx.params.interface as string, body)
})