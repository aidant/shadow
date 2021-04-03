export const createPrivateKey = (): string => {
  return ''
}

export const createPublicKey = (privateKey: string): string => {
  return ''
}

interface KeyPair {
  privateKey: string
  publicKey: string
}

export const createKeyPair = (): KeyPair => {
  const privateKey = createPrivateKey()
  const publicKey = createPublicKey(privateKey)
  
  return {
    privateKey,
    publicKey
  }
}