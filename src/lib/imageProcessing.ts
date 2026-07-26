type Options = {
  maxDimension?: number
  quality?: number
}

/** Downscales to maxDimension (longest side) and re-encodes as WebP, client-side, before upload. */
export async function resizeAndConvertToWebp(
  file: File,
  { maxDimension = 800, quality = 0.8 }: Options = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas 2D context niet beschikbaar')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('WebP-conversie mislukt'))),
      'image/webp',
      quality,
    )
  })
}
