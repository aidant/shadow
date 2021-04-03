const parseIP = (ip: string): bigint => {
  const [octet0, octet1, octet2, octet3] = ip.split('.').map(BigInt)
  return (octet0 << 24n) + (octet1 << 16n) + (octet2 << 8n) + (octet3 << 0n)  
}
const parseCIDR = (cidr: string) => {
  const [ip, mask] = cidr.split('/')
  return [parseIP(ip), BigInt(mask)]
}
const formatIP = (ip: bigint, mask: bigint): string => {
  const octet0 = (ip >> 24n) & 255n
  const octet1 = (ip >> 16n) & 255n
  const octet2 = (ip >> 8n) & 255n
  const octet3 = (ip >> 0n) & 255n

  return `${octet0}.${octet1}.${octet2}.${octet3}/${mask}`
}

interface Options {
  base?: boolean
  broadcast?: boolean
  mask?: number | bigint | string
}
export const createIP = (string: string, index: number | bigint | string, { base = true, broadcast = true, mask }: Options = {}) => {
  const [ip, cidr] = parseCIDR(string)
  const bitmask = 0xFFFF_FFFFn << 32n - cidr & 0xFFFF_FFFFn
  index = BigInt(index)

  if (base) index++
  if (index & bitmask || (broadcast && (index | bitmask) === 0xFFFF_FFFFn)) {
    throw new Error('exceeds cidr range')
  }

  return formatIP((ip & bitmask) + index, BigInt(mask ?? cidr))
}
 