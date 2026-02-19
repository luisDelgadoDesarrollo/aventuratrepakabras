import type { ImageFormItem } from "~/types/forms"

export interface ImagePayloadItem {
  image: string
  description?: string
}

export const createClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export const createEmptyImageItem = (index = 1): ImageFormItem => ({
  clientId: createClientId(),
  image: `image-${index}`,
  description: "",
  file: null,
  existing: false,
  sourcePath: null
})

export const createExistingImageItem = (imagePath: string, index: number): ImageFormItem => ({
  clientId: createClientId(),
  image: `image-${index + 1}`,
  description: "",
  file: null,
  existing: true,
  sourcePath: imagePath
})

const getFileExtension = (path: string) => {
  const cleanPath = path.split("?")[0]
  const lastDotIndex = cleanPath.lastIndexOf(".")
  if (lastDotIndex === -1) return ""
  return cleanPath.slice(lastDotIndex)
}

export const buildImagePayload = async (
  items: ImageFormItem[],
  resolveImageKey: (index: number) => string,
  resolveImageUrl: (path: string) => string
) => {
  const orderedItems = items.filter((item) => item.existing || item.file)
  const payload: ImagePayloadItem[] = []
  const files: Record<string, File> = {}

  for (let index = 0; index < orderedItems.length; index += 1) {
    const item = orderedItems[index]
    const imageKey = resolveImageKey(index)

    payload.push({
      image: imageKey,
      description: item.description || undefined
    })

    if (item.file) {
      files[imageKey] = item.file
      continue
    }

    if (!item.existing || !item.sourcePath) continue

    const response = await fetch(resolveImageUrl(item.sourcePath), { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`No se pudo recuperar la imagen existente ${imageKey}`)
    }

    const blob = await response.blob()
    const extension = getFileExtension(item.sourcePath)
    files[imageKey] = new File([blob], `${imageKey}${extension}`, {
      type: blob.type || "application/octet-stream"
    })
  }

  return {
    payload,
    files
  }
}
