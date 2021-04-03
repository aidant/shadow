import { ConfigurationInterface, getConfiguration, setConfiguration } from './configuration.ts'
import { createKeyPair } from '@shadow/tools/curve25519.ts'
import { run } from '../utilities/cli.ts'
import { createIP } from '../utilities/ip.ts'

interface Interface {
  name: string
  host: string
  port: number
  cidr: string
}

export const listInterfaces = (): Interface[] => {
  const configuration = getConfiguration()
  const interfaces: Interface[] = []
  
  for (const name in configuration) {
    const config = configuration[name]

    interfaces.push({
      name,
      host: config.host,
      port: config.port,
      cidr: config.cidr,
    })
  }

  return interfaces
}

const getDefaultInterface = () => {
  return run('route | grep "^default" | grep -o "[^ ]*$"')
}

const startInterface = async (descriptor: ConfigurationInterface) => {
  const interfaceOut = await getDefaultInterface()
  const ip = createIP(descriptor.cidr, 0n)

  await run(
    `ip link add dev ${descriptor.name} type wireguard`,
    `ip address add dev ${descriptor.name} ${ip}`,
    `wg setconf ${descriptor.name} configuration/${descriptor.name}.conf`,
    `ip link set up dev ${descriptor.name}`,
    `iptables -A FORWARD -i ${descriptor.name} -j ACCEPT`,
    `iptables -t nat -A POSTROUTING -o ${interfaceOut} -j MASQUERADE`,
  )
}

const stopInterface = async (descriptor: ConfigurationInterface) => {
  const interfaceOut = await getDefaultInterface()

  await run(
    `ip link delete dev ${descriptor.name}`,
    `iptables -D FORWARD -i ${descriptor.name} -j ACCEPT`,
    `iptables -t nat -D POSTROUTING -o ${interfaceOut} -j MASQUERADE`,
  )
}

export const createInterface = async (descriptor: Interface) => {
  const configuration = getConfiguration()

  if (descriptor.name in configuration) {
    throw new Error(`Interface ${descriptor.name} already exists.`)
  }

  const { privateKey, publicKey } = createKeyPair()

  configuration[descriptor.name] = {
    privateKey,
    publicKey,

    name: descriptor.name,
    host: descriptor.host,
    port: descriptor.port,
    cidr: descriptor.cidr,

    peers: [],
  }

  await setConfiguration()
  await startInterface(configuration[descriptor.name])
}

Deno.signals.terminate()
  .then(() => Promise.all(Object.values(getConfiguration()).map(stopInterface)))