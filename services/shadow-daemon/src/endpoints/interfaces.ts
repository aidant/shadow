import { Router } from 'oak'
import { listInterfaces, createInterface } from '../wireguard/interfaces.ts'

export const interfaces = new Router({ prefix: '/interfaces' })

interfaces.get('/', (ctx) => {
  ctx.response.body = listInterfaces()
})

interfaces.post('/:interface', async (ctx) => {
  const body = await ctx.request.body({ type: 'json' }).value
  ctx.response.body = createInterface({ name: ctx.params.interface as string, ...body })
})
