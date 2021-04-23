import { DIRECTORY } from '../environment.ts'

await Deno.mkdir(DIRECTORY, { recursive: true })
export const path = (...segments: string[]) => [DIRECTORY, ...segments].join('/').replace(/\/+/g, '/')
