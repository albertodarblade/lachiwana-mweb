import imageCompression from 'browser-image-compression'

// Vercel serverless limit is 4.5 MB — keep non-images well under that.
export const MAX_FILE_MB = 4
// Accept large originals and compress them down.
export const MAX_IMAGE_ORIGINAL_MB = 20

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.85,
}

export async function prepareFileForUpload(file) {
  const isImage = file.type.startsWith('image/')
  const sizeMB = file.size / 1024 / 1024

  if (isImage) {
    if (sizeMB > MAX_IMAGE_ORIGINAL_MB) {
      throw new Error(`La imagen supera el límite de ${MAX_IMAGE_ORIGINAL_MB} MB.`)
    }
    if (sizeMB <= COMPRESSION_OPTIONS.maxSizeMB) return file
    return imageCompression(file, COMPRESSION_OPTIONS)
  }

  if (sizeMB > MAX_FILE_MB) {
    throw new Error(`El archivo supera el límite de ${MAX_FILE_MB} MB.`)
  }
  return file
}
