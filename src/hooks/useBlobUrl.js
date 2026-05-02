import { useQuery } from '@tanstack/react-query'
import { getBlob } from '../api/client'

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ dataUrl: reader.result, mimeType: blob.type })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function useBlobUrl(fileSrcId) {
  return useQuery({
    queryKey: ['file', fileSrcId],
    queryFn: async () => {
      const blob = await getBlob(`/api/v1/files/${fileSrcId}`)
      const { dataUrl, mimeType } = await blobToDataUrl(blob)
      return { dataUrl, mimeType, isImage: mimeType.startsWith('image/') }
    },
    enabled: !!fileSrcId,
    staleTime: Infinity,
  })
}
