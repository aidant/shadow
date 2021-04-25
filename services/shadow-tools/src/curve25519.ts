/*
  This Curve25519 implementation is ported from TweetNaCl JS which in turn was
  ported from TweetNaCL. I have manually tree shaken the JavaScript port to
  include only the functions needed for Curve25519 and lightly modified the
  source. 

  See: https://github.com/dchest/tweetnacl-js/blob/f1ec050ceae0861f34280e62498b1d3ed9c350c6/nacl.js#L386-L437
*/

const gf = (init?: number[]) => {
  const r = new Float64Array(16)

  if (init) {
    for (let i = 0; i < init.length; i++) {
      r[i] = init[i]
    }
  }

  return r
}

const unpack25519 = (o: Float64Array, n: Uint8Array) => {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }

  o[15] &= 0x7fff
}

const sel25519 = (p: Float64Array, q: Float64Array, b: number) => {
  let t
  let c = ~(b - 1)

  for (let i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i])
    p[i] ^= t
    q[i] ^= t
  }
}

const A = (o: Float64Array, a: Float64Array, b: Float64Array) => {
  for (let i = 0; i < 16; i++) {
    o[i] = (a[i] + b[i]) | 0
  }
}

const Z = (o: Float64Array, a: Float64Array, b: Float64Array) => {
  for (let i = 0; i < 16; i++) {
    o[i] = (a[i] - b[i]) | 0
  }
}

const M = (o: Float64Array, a: Float64Array, b: Float64Array) => {
  let t = new Float64Array(31)

  for (let i = 0; i < 31; i++) {
    t[i] = 0
  }
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j]
    }
  }
  for (let i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16]
  }
  for (let i = 0; i < 16; i++) {
    o[i] = t[i]
  }
  car25519(o)
  car25519(o)
}

const S = (o: Float64Array, a: Float64Array) => {
  M(o, a, a)
}

const inv25519 = (o: Float64Array, i: Float64Array) => {
  let c = gf()

  for (let a = 0; a < 16; a++) {
    c[a] = i[a]
  }
  for (let a = 253; a >= 0; a--) {
    S(c, c)
    if (a !== 2 && a !== 4) {
      M(c, c, i)
    }
  }
  for (let a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}

const car25519 = (o: Float64Array) => {
  let c

  for (let i = 0; i < 16; i++) {
    o[i] += 65536
    c = Math.floor(o[i] / 65536)
    o[(i + 1) * (i < 15 ? 1 : 0)] += c - 1 + 37 * (c - 1) * (i === 15 ? 1 : 0)
    o[i] -= (c * 65536)
  }
}

const pack25519 = (o: Uint8Array, n: Float64Array) => {
  let b
  let m = gf()
  let t = gf()
  for (let i = 0; i < 16; i++) {
    t[i] = n[i]
  }
  car25519(t)
  car25519(t)
  car25519(t)
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed
    for (let i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1)
      m[i - 1] &= 0xffff
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1)
    b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}

const createPresharedKey = (): Uint8Array => {
  const presharedKey = new Uint8Array(32)
  crypto.getRandomValues(presharedKey)
  return presharedKey
}

const createPrivateKey = (): Uint8Array => {
  const privateKey = new Uint8Array(32)
  crypto.getRandomValues(privateKey)

  privateKey[31] = (privateKey[31] & 127) | 64
  privateKey[0] &= 248

  return privateKey
}

const createPublicKey = (privateKey: Uint8Array): Uint8Array => {
  const publicKey = new Uint8Array(32)

  const z = new Uint8Array(32)
  const x = new Float64Array(80)
  let r
  const a = gf()
  const b = gf()
  const c = gf()
  const d = gf()
  const e = gf()
  const f = gf()
  const _121665 = gf([0xdb41, 1])
  const _9 = new Uint8Array(32); _9[0] = 9

  for (let i = 0; i < 31; i++) {
    z[i] = privateKey[i]
  }

  z[31] = (privateKey[31] & 127) | 64
  z[0] &= 248

  unpack25519(x, _9)

  for (let i = 0; i < 16; i++) {
    b[i] = x[i]
    d[i] = a[i] = c[i] = 0
  }

  a[0] = d[0] = 1

  for (let i = 254; i >= 0; --i) {
    r = (z[i >>> 3] >>> (i & 7)) & 1
    sel25519(a, b, r)
    sel25519(c, d, r)
    A(e, a, c)
    Z(a, a, c)
    A(c, b, d)
    Z(b, b, d)
    S(d, e)
    S(f, a)
    M(a, c, a)
    M(c, b, e)
    A(e, a, c)
    Z(a, a, c)
    S(b, a)
    Z(c, d, f)
    M(a, c, _121665)
    A(a, a, d)
    M(c, c, a)
    M(a, d, f)
    M(d, b, x)
    S(b, e)
    sel25519(a, b, r)
    sel25519(c, d, r)
  }

  for (let i = 0; i < 16; i++) {
    x[i + 16] = a[i]
    x[i + 32] = c[i]
    x[i + 48] = b[i]
    x[i + 64] = d[i]
  }

  const x32 = x.subarray(32)
  const x16 = x.subarray(16)
  inv25519(x32, x32)
  M(x16, x16, x32)
  pack25519(publicKey, x16)

  return publicKey
}

const createBase64EncodedKey = (key: Uint8Array): string => {
  return btoa(String.fromCharCode(...key))
}

interface KeyPair {
  privateKey: string
  presharedKey: string
  publicKey: string
}

export const createKeyPair = (): KeyPair => {
  const privateKey = createPrivateKey()
  const presharedKey = createPresharedKey()
  const publicKey = createPublicKey(privateKey)

  return {
    privateKey: createBase64EncodedKey(privateKey),
    presharedKey: createBase64EncodedKey(presharedKey),
    publicKey: createBase64EncodedKey(publicKey),
  }
}
