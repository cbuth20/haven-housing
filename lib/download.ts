/**
 * Browser-only helpers for triggering a file download from in-memory text.
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'text/csv;charset=utf-8'
): void {
  downloadBlob(new Blob([content], { type: mimeType }), filename)
}

export function downloadBinaryFile(bytes: Uint8Array, filename: string, mimeType: string): void {
  downloadBlob(new Blob([bytes as BlobPart], { type: mimeType }), filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/** Local-time YYYY-MM-DD, suitable for filenames. */
export function formatDateForFilename(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
