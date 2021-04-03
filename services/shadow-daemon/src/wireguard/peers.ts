import { run } from '../utilities/cli.ts'
import { ini } from '../utilities/ini.ts'
import { createIP } from '../utilities/ip.ts'
import { getConfiguration, setConfiguration } from './configuration.ts'

interface Peer {
  name: string
  ip: string
}

interface CreatePeerDescriptor {
  name: string
  publicKey: string
  presharedKey: string
}

export const listPeers = (name: string): Peer[] => {
  const configuration = getConfiguration()
  const config = configuration[name]

  if (!config) {
    throw new Error(`Interface ${name} does not exist.`)
  }

  const peers: Peer[] = []

  for (const peer of config.peers) {
    peers.push({
      name: peer.name,
      ip: peer.ip,
    })
  }

  return peers
}

export const createPeer = async (name: string, descriptor: CreatePeerDescriptor) => {
  const configuration = getConfiguration()
  const config = configuration[name]

  if (!config) {
    throw new Error(`Interface ${name} does not exist.`)
  }

  const index = config.peers.length

  config.peers.push({
    name: descriptor.name,

    publicKey: descriptor.publicKey,
    presharedKey: descriptor.presharedKey,

    ip: createIP(config.cidr, index, { mask: 32 }),
  })

  await setConfiguration()
  await run(`wg syncconf ${name} configuration/${name}.conf`)

  return ini({
    Interface: {
      PrivateKey: 'PRIVATE_KEY',
      Address: createIP(config.cidr, index),
      DNS: '1.1.1.1, 1.0.0.1',
    },
    Peer: {
      PublicKey: config.publicKey,
      PresharedKey: descriptor.presharedKey,
      AllowedIPs: '0.0.0.0/0, ::/0',
      Endpoint: `${config.host}:${config.port}`,
    },
  })
}