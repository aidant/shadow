const env = Deno.env.toObject()

export const PORT = Number(env.PORT) || 80
export const HOST = env.HOST || '0.0.0.0'
export const DIRECTORY = env.DIRECTORY || `${env.HOME}/.shadow-daemon`.replace(/\/+/g, '/')
export const DOMAIN_NAME = env.DOMAIN_NAME
