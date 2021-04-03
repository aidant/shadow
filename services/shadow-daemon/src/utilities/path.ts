import { join } from 'path'
import { DIRECTORY } from '../environment.ts'

export const path = (...segments: string[]) => join(DIRECTORY, ...segments)
