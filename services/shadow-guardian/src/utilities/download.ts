export const download = (filename: string, content: BlobPart, type: string = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  queueMicrotask(() => {
    URL.revokeObjectURL(url)
  })
}
