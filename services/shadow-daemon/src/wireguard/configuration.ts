import { DIRECTORY } from '../environment.ts'
import { ini } from '../utilities/ini.ts'
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

export interface ConfigurationInterface {
  readonly privateKey: string
  readonly publicKey: string
  
  readonly name: string
  readonly host: string
  readonly port: number
  readonly cidr: string

  readonly peers: {
    name: string

    readonly publicKey: string
    readonly presharedKey: string
    readonly ip: string
  }[]
}

export interface Configuration {
  [name: string]: ConfigurationInterface
}

let configuration: Configuration = await Deno.readTextFile(path('configuration.json')).then(JSON.parse)

export const getConfiguration = () => {
  return configuration
}

export const setConfiguration = async () => {
  const promises: Promise<unknown>[] = [
    Deno.writeTextFile(path('configuration.json'), JSON.stringify(configuration, null, 2))
  ]

  for (const name in configuration) {
    const config = configuration[name]

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
      Deno.writeTextFile(path(`${name}.conf`), ini(wireguard))
    )
  }

  await Promise.all(promises)
}