export const ini = <T extends object>(object: T): string => {
  let ini = ''

  for (const [property, value] of Object.entries(object)) {
    const values = Array.isArray(value) ? value : [value] 

    for (const object of values) {
      const content = Object.entries(object)
        .map(([property, value]) => `${property} = ${value}`)
        .join('\n')
      ini += `[${property}]\n${content}\n\n`
    }
  }

  return ini
}