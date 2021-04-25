import { DIRECTORY } from './environment.ts'
import { run } from './utilities/cli.ts'
import { startAllInterfaces, stopAllInterfaces } from './wireguard/interfaces.ts'

let ipv4forwarding: boolean

const getIPv4Forwarding = async () => {
  const result = await run('sysctl -qn net.ipv4.ip_forward')
  if (result === '0') return false
  if (result === '1') return true
  throw new Error('Failed to get ipv4 forwarding status.')
}

const setIPv4Forwarding = async (enabled: boolean) => {
  await run(`sysctl -w net.ipv4.ip_forward=${enabled ? 1 : 0}`)
}

export const systemStart = async () => {
  await Deno.mkdir(DIRECTORY, { recursive: true })
  
  ipv4forwarding = await getIPv4Forwarding()
  if (!ipv4forwarding) {
    await setIPv4Forwarding(true)
  }

  await startAllInterfaces()
}

export const systemStop = async () => {
  await stopAllInterfaces()
  
  if (!ipv4forwarding) {
    await setIPv4Forwarding(false)
  }
}