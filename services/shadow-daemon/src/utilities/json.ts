export const json = async (specifier: string) => {
  try {
    return await Deno.readTextFile(specifier).then(JSON.parse)
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return undefined
    }
    throw err
  }
}