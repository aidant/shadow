import { CreatePeerDescriptor } from '@shadow/tools/types.ts'
import { run } from '../utilities/cli.ts'
import { ini } from '../utilities/ini.ts'
import { createIP } from '../utilities/ip.ts'
import { getConfiguration, getPublicConfigurationMetadata, setConfiguration } from './configuration.ts'
import { RouteParams } from 'oak'
import { path } from '../utilities/path.ts'

export const validatePeer = (body: CreatePeerDescriptor, { interface: name }: RouteParams) => {
  const errors: Error[] = []
  const error = (message: string) => errors.push(new Error(message))

  if (!body) {
    throw new Error('Unprocessable Entity')
  }

  if (typeof body !== 'object') {
    throw new Error('Unprocessable Entity')
  }

  if (!body.name) {
    error('Property "name" is required.')
  }

  if (typeof body.name !== 'string') {
    error('Property "name" must be a string.')
  }

  if (body.name?.length > 32) {
    error('Property "name" is longer than 32 characters.')
  }

  if (!/^[a-z0-9-]+$/i.test(body.name)) {
    error('Property "name" includes invalid characters.')
  }

  if (!body.presharedKey) {
    error('Property "presharedKey" is required.')
  }

  if (typeof body.presharedKey !== 'string') {
    error('Property "presharedKey" must be a string.')
  }

  if (body.presharedKey?.length > 64) {
    error('Property "presharedKey" is longer than 64 characters.')
  }

  if (!/^[a-z0-9/+]+={1,3}$/i.test(body.presharedKey)) {
    error('Property "presharedKey" includes invalid characters.')
  }

  if (!body.publicKey) {
    error('Property "publicKey" is required.')
  }

  if (typeof body.publicKey !== 'string') {
    error('Property "publicKey" must be a string.')
  }

  if (body.publicKey?.length > 64) {
    error('Property "publicKey" is longer than 64 characters.')
  }

  if (!/^[a-z0-9/+]+={1,3}$/i.test(body.publicKey)) {
    error('Property "publicKey" includes invalid characters.')
  }

  if (!name) {
    error('InterfaceName is required.')
  }

  if (typeof name !== 'string') {
    error('InterfaceName must be a string.')
  }

  if (!/^[a-z0-9-]+$/i.test(name as string)) {
    error('InterfaceName includes invalid characters.')
  }

  if (errors.length) {
    throw new AggregateError(errors, 'Unprocessable Entity')
  }
}

export const createPeer = async (interfaceName: string, descriptor: CreatePeerDescriptor) => {
  const configuration = await getConfiguration()
  const metadata = await getPublicConfigurationMetadata()
  const iface = configuration.interfaces.find(iface => iface.name === interfaceName)

  if (!iface) {
    throw new Error(`Interface ${interfaceName} does not exist.`)
  }

  const index = iface.peers.length

  iface.peers.push({
    name: descriptor.name,

    publicKey: descriptor.publicKey,
    presharedKey: descriptor.presharedKey,

    ip: createIP(iface.ipv4, index, { mask: 32 }),
  })

  await setConfiguration()
  await run(`wg syncconf ${interfaceName} ${path(`${descriptor.name}.conf`)}`)

  return ini({
    Interface: {
      PrivateKey: 'PRIVATE_KEY',
      Address: createIP(iface.ipv4, index),
      DNS: '1.1.1.1, 1.0.0.1',
    },
    Peer: {
      PublicKey: iface.publicKey,
      PresharedKey: descriptor.presharedKey,
      AllowedIPs: '0.0.0.0/0, ::/0',
      Endpoint: `${metadata.host}:${iface.port}`,
    },
  })
}