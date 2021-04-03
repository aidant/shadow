const env = Deno.env.toObject()

export const PORT = Number(env.PORT) || 8080
export const HOST = env.HOST || '0.0.0.0'
export const DIRECTORY = env.DIRECTORY || 'data'