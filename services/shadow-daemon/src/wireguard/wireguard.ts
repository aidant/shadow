import { run } from '../utilities/cli.ts'

const parseString = (string: string): string | null => {
  if (string === '(none)') return null
  return string
}

const parseNumber = (number: string): number => {
  if (!number || number === 'off') return 0
  return +number
}

const parseTimestamp = (timestamp: string): Date | null => {
  const milliseconds = parseNumber(timestamp) * 1000
  return milliseconds ? new Date(milliseconds) : null
}

interface WireguardDumpPeer {
  interfaceName: string
  publicKey: string
  presharedKey: string
  endpoint: string | null
  allowedIps: string
  latestHandshake: Date | null
  transferRx: number
  transferTx: number
  persistentKeepalive: number
}

interface WireguardDumpInterface {
  interfaceName: string
  privateKey: string
  publicKey: string
  listenPort: number
  fwmark: number
  peers: WireguardDumpPeer[]
}

interface WireguardDump {
  [interfaceName: string]: WireguardDumpInterface
}

const parseWireguardDump = (dump: string): WireguardDump => {
  const lines = dump.split(/\r?\n/).map(line => line.split(/\s+/))

  const interfaces: WireguardDump = {}

  for (const segments of lines) {
    if (segments.length === 5) {
      const [
        interfaceName,
        privateKey,
        publicKey,
        listenPort,
        fwmark,
      ] = segments

      interfaces[interfaceName] = {
        interfaceName: parseString(interfaceName) as string,
        privateKey: parseString(privateKey) as string,
        publicKey: parseString(publicKey) as string,
        listenPort: parseNumber(listenPort),
        fwmark: parseNumber(fwmark),
        peers: [],
      }
    }

    if (segments.length === 9) {
      const [
        interfaceName,
        publicKey,
        presharedKey,
        endpoint,
        allowedIps,
        latestHandshake,
        transferRx,
        transferTx,
        persistentKeepalive,
      ] = segments

      interfaces[interfaceName].peers.push({
        interfaceName: parseString(interfaceName) as string,
        publicKey: parseString(publicKey) as string,
        presharedKey: parseString(presharedKey) as string,
        endpoint: parseString(endpoint),
        allowedIps: parseString(allowedIps) as string,
        latestHandshake: parseTimestamp(latestHandshake),
        transferRx: parseNumber(transferRx),
        transferTx: parseNumber(transferTx),
        persistentKeepalive: parseNumber(persistentKeepalive),
      })
    }
  }

  return interfaces
}

export const show = async (): Promise<WireguardDump> => {
  const dump = await run('wg show all dump')
  return parseWireguardDump(dump)
}