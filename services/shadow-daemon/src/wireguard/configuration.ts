import { PrivateConfiguration, PublicConfiguration } from '@shadow/tools/types.ts'
import { DOMAIN_NAME } from '../environment.ts'
import { run } from '../utilities/cli.ts'
import { ini } from '../utilities/ini.ts'
import { json } from '../utilities/json.ts'
import { path } from '../utilities/path.ts'

interface WireguardConfiguration {
  Interface: {
    PrivateKey: string
    ListenPort?: number
    FwMark?: number
  },
  Peer: {
    PublicKey: string
    PresharedKey?: string
    AllowedIPs?: string
    Endpoint?: string
    PersistentKeepalive?: number
  }[]
}


let configuration: PrivateConfiguration = (await json(path('configuration.json'))) || {
  interfaces: []
}

export const getConfiguration = (): PrivateConfiguration => {
  return configuration
}

const getPublicIPv4Address = async (): Promise<string | null> => {
  const dug = await run('dig -4 @1.1.1.1 ch txt whoami.cloudflare +short')
  const [ip] = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.exec(dug) || []
  if (!ip) return null
  return ip
}

const getPublicIPv4DomainName = async (ipv4: string): Promise<string | null> => {
  const dug = await run(`dig -4 @1.1.1.1 ptr -x ${ipv4} +short`)
  const domain = dug.trim().replace(/\.$/, '')
  if (!domain) return null
  return domain
}

export const getPublicConfigurationMetadata = async (): Promise<PublicConfiguration['metadata']> => {
  let host = DOMAIN_NAME

  if (!host) {
    const address = await getPublicIPv4Address()
    if (!address) throw new Error('Unable to resolve host.')
    const domainName = await getPublicIPv4DomainName(address)
    host = domainName || address
  }

  return {
    host
  }
}

export const getPublicConfiguration = async (): Promise<PublicConfiguration> => {
  return {
    metadata: await getPublicConfigurationMetadata(),
    interfaces: configuration.interfaces.map(iface => ({
      name: iface.name,
      port: iface.port,
      ipv4: iface.ipv4,
      peers: iface.peers.map(peer => ({
        name: peer.name,
        ip: peer.ip
      }))
    }))
  }
}

export const setConfiguration = async () => {
  const promises: Promise<unknown>[] = [
    Deno.writeTextFile(path('configuration.json'), JSON.stringify(configuration, null, 2))
  ]

  for (const config of configuration.interfaces) {
    const wireguard: WireguardConfiguration = {
      Interface: {
        PrivateKey: config.privateKey,
        ListenPort: config.port,
      },
      Peer: config.peers
        .map(peer => ({
          PublicKey: peer.publicKey,
          PresharedKey: peer.presharedKey,
          AllowedIPs: peer.ip,
        })),
    }

    promises.push(
      Deno.writeTextFile(path(`${config.name}.conf`), ini(wireguard))
    )
  }

  await Promise.all(promises)
}