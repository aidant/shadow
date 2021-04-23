import { DIRECTORY } from '../environment.ts'

export const path = (...segments: string[]) => [DIRECTORY, ...segments].join('/').replace(/\/+/g, '/')
