const keyCodes = {
  enter: 13,
  space: 32
}

export const isKey = (event: KeyboardEvent, key: keyof typeof keyCodes) => {
  return (
    event.code?.toLowerCase() === key ||
    event.key?.toLowerCase() === key ||
    event.which === keyCodes[key] ||
    event.keyCode === keyCodes[key]
  )
}