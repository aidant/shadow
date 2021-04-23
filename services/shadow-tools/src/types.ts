export interface Interface {
  name: string
  port: number
  ipv4: string
}

export type Interfaces = Interface[]
export type InterfaceRecord = Record<string, Interface>

export interface CreatePeerDescriptor {
  name: string
  publicKey: string
  presharedKey: string
}

export interface Peer {
  name: string
  ip: string
}

export type Peers = Peer[]
export type PeerRecord = Record<string, Peer>


interface BaseConfigurationPeers {
  name: string
  ip: string
}

export interface PrivateConfigurationPeers extends BaseConfigurationPeers {
  readonly publicKey: string
  readonly presharedKey: string

  readonly ip: string
}

export interface PublicConfigurationPeers extends BaseConfigurationPeers {
  
}

interface BaseConfigurationInterface {
  name: string
  port: number
  ipv4: string
  peers: BaseConfigurationPeers[]
}

export interface PrivateConfigurationInterface extends BaseConfigurationInterface {
  readonly privateKey: string
  readonly publicKey: string

  readonly name: string
  readonly port: number
  readonly ipv4: string
  peers: PrivateConfigurationPeers[]
}

export interface PublicConfigurationInterface extends BaseConfigurationInterface {
  peers: PublicConfigurationPeers[]
}

interface BaseConfiguration {
  interfaces: BaseConfigurationInterface[]
}

export interface PrivateConfiguration extends BaseConfiguration {
  interfaces: PrivateConfigurationInterface[]
}

export interface PublicConfiguration extends BaseConfiguration {
  metadata: {
    host: string
  }
  interfaces: PublicConfigurationInterface[]
}