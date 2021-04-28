import { DIRECTORY } from '../environment.ts'

interface Result {
  success: boolean
  code: number
  signal: number | undefined
  stdout: string
  stderr: string
}

class CommandError extends Error {
  declare result: Result

  constructor(result: Result) {
    super(result.stderr)
    this.result = result
  }
}

export const cli = async (command: string[], directory: string = DIRECTORY, environment: Record<string, string> = {}): Promise<Result> => {
  const process = Deno.run({
    cmd: command,
    cwd: directory,
    env: environment,
    stdout: 'piped',
    stderr: 'piped',
    stdin: 'piped',
  })

  const [status, stdoutArrayBuffer, stderrArrayBuffer] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ])

  const stdout = new TextDecoder().decode(stdoutArrayBuffer)
  const stderr = new TextDecoder().decode(stderrArrayBuffer)

  console.log(`cli:\n\tcommand: ${command.join(' ')}\n\tdirectory: ${directory}\n\tenvironment: ${JSON.stringify(environment)}\n\tsuccess: ${status.success}\n\tcode: ${status.code}\n\tsignal: ${status.signal}\n\tstdout: ${stdout}\n\t${stderr}`)

  return {
    success: status.success,
    code: status.code,
    signal: status.signal,
    stdout: stdout,
    stderr: stderr,
  }
}

export async function run (command: string): Promise<string>
export async function run (...commands: string[]): Promise<string[]>
export async function run (...commands: string[]): Promise<string | string[]> {
  const results: string[] = []

  for (const string of commands) {
    const command = string.match(/("|'|`)(?:(?!\1).)* *\1|[^\s]+/g) || []
    const result = await cli(command)
    if (result.success) {
      results.push(result.stdout.trim())
    } else {
      throw new CommandError(result)
    }
  }

  return commands.length === 1
    ? results[0]
    : results
}

type ActionParsed = {
  run: string[]
  cleanup: string[]
}

interface Transaction {
  add (run: string | string[], cleanup?: string | string[]): void
  commit (): Promise<void>
}

export const createTransaction = (): Transaction => {
  const actions: ActionParsed[] = []

  const add = (run: string | string[], cleanup: string | string[] = []) => {
    actions.push({
      run: Array.isArray(run) ? run : [run],
      cleanup: Array.isArray(cleanup) ? cleanup : [cleanup],
    })
  }

  const commit = async () => {
    const cleanup: string[] = []

    for (const action of actions) {
      try {
        cleanup.push(...action.cleanup)
        await run(...action.run)
      } catch (error) {
        try {
          await run(...cleanup)
        } finally {
          throw error
        }
      }
    }
  }

  return { add, commit }
}