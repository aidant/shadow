import { getConfiguration, setConfiguration } from './configuration.ts'
import { createKeyPair } from '@shadow/tools/curve25519.ts'
import { Interface, PrivateConfigurationInterface, PrivateConfiguration } from '@shadow/tools/types.ts'
import { createTransaction, run } from '../utilities/cli.ts'
import { createIP } from '../utilities/ip.ts'
import { path } from '../utilities/path.ts'
import * as wg from './wireguard.ts'

export const validateInterface = (descriptor?: Interface) => {
  const errors: Error[] = []
  const error = (message: string) => errors.push(new Error(message))

  if (!descriptor) {
    throw new Error('Unprocessable Entity')
  }

  if (typeof descriptor !== 'object') {
    throw new Error('Unprocessable Entity')
  }

  if (!descriptor.name) {
    error('Property "name" is required.')
  }
  
  if (typeof descriptor.name !== 'string') {
    error('Property "name" must be a string.')
  }

  if (descriptor.name?.length > 32) {
    error('Property "name" is longer than 32 characters.')
  }

  if (!/^[a-z0-9-]+$/i.test(descriptor.name)) {
    error('Property "name" includes invalid characters.')
  }

  if (!descriptor.port) {
    error('Property "port" is required.')
  }

  if (typeof descriptor.port !== 'number') {
    error('Property "port" must be a number.')
  }

  if (descriptor.port < 0) {
    error('Property "port" cannot be smaller than 0.')
  }

  if (descriptor.port > 65_535) {
    error('Property "port" cannot be larger than 65,535.')
  }

  if (!descriptor.ipv4) {
    error('Property "ipv4" is required.')
  }

  if (typeof descriptor.ipv4 !== 'string') {
    error('Property "ipv4" must be a string.')
  }

  if (descriptor.ipv4?.length > 18) {
    error('Property "ipv4" is longer than 18 characters.')
  }

  if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([1-9]|[1-2]\d|3[0-2])$/.test(descriptor.ipv4)) {
    error('Property "ipv4" is not in the format of a CIDR range.')
  }

  if (errors.length) {
    throw new AggregateError(errors, 'Unprocessable Entity')
  }
}

const getDefaultInterface = async (): Promise<string> => {
  const route = await run('route')
  const defaultInterface = route.match(/^default.+?(?<interface>[^ ]*)$/im)?.groups?.interface
  if (!defaultInterface) throw new Error('Unable to get default interface.')
  return defaultInterface
}

const startInterface = async (descriptor: PrivateConfigurationInterface) => {
  const transaction = createTransaction()
  const interfaceOut = await getDefaultInterface()
  const ip = createIP(descriptor.ipv4, 0n)

  const interfaceName = descriptor.name

  let interfaceExists = null
  try {
    await run(`ip link show dev ${interfaceName}`)
    interfaceExists = true
  } catch {
    interfaceExists = false
  }

  let interfaceIsWireguard = null
  if (interfaceExists) {
    if (interfaceName in await wg.show()) {
      interfaceIsWireguard = true
    } else {
      interfaceIsWireguard = false
    }
  }

  if (!interfaceExists) {
    transaction.add(`ip link add dev ${interfaceName} type wireguard`)
    transaction.add(
      `ip address add dev ${interfaceName} ${ip}`,
      `ip link delete dev ${descriptor.name}`
    )
  } else if (!interfaceIsWireguard) {
    throw new Error(`Interface: "${interfaceName}" already exists and is not a wireguard interface.`)
  }

  transaction.add([
    `wg setconf ${interfaceName} ${path(`${interfaceName}.conf`)}`,
    `ip link set up dev ${interfaceName}`
  ])

  transaction.add(
    `iptables -A FORWARD -i ${interfaceName} -j ACCEPT`,
    `iptables -D FORWARD -i ${descriptor.name} -j ACCEPT`
  )

  transaction.add(
    `iptables -t nat -A POSTROUTING -o ${interfaceOut} -j MASQUERADE`,
    `iptables -t nat -D POSTROUTING -o ${interfaceOut} -j MASQUERADE`
  )

  transaction.add(
    `iptables -A INPUT -p udp -m udp --dport ${descriptor.port} -j ACCEPT`,
    `iptables -D INPUT -p udp -m udp --dport ${descriptor.port} -j ACCEPT`
  )

  transaction.add(
    `iptables -A FORWARD -o ${interfaceName} -j ACCEPT`,
    `iptables -D FORWARD -o ${descriptor.name} -j ACCEPT`
  )

  await transaction.commit()
}

const stopInterface = async (descriptor: PrivateConfigurationInterface) => {
  const interfaceOut = await getDefaultInterface()
  
  await run(
    `ip link delete dev ${descriptor.name}`,
    `iptables -D FORWARD -i ${descriptor.name} -j ACCEPT`,
    `iptables -t nat -D POSTROUTING -o ${interfaceOut} -j MASQUERADE`,
    `iptables -D INPUT -p udp -m udp --dport ${descriptor.port} -j ACCEPT`,
    `iptables -D FORWARD -o ${descriptor.name} -j ACCEPT`,
  )
}

export const createInterface = async (descriptor: Interface): Promise<Interface> => {
  const configuration = getConfiguration()

  if (configuration.interfaces.find(iface => iface.name === descriptor.name)) {
    throw new Error(`Interface ${descriptor.name} already exists.`)
  }

  const { privateKey, publicKey } = createKeyPair()

  const publicInterface: Interface = {
    name: descriptor.name,
    port: descriptor.port,
    ipv4: descriptor.ipv4,
  }

  const privateInterface: PrivateConfigurationInterface = {
    privateKey,
    publicKey,

    ...publicInterface,

    peers: [],
  }

  configuration.interfaces.push(privateInterface)

  await setConfiguration()
  await startInterface(privateInterface)

  return publicInterface
}

export const startAllInterfaces = async () => {
  await setConfiguration()
  const configuration = getConfiguration()

  for (const descriptor of configuration.interfaces) {
    await startInterface(descriptor)
  }
}

export const stopAllInterfaces = async () => {
  const configuration = getConfiguration()

  for (const descriptor of configuration.interfaces) {
    await stopInterface(descriptor)
  }
}
