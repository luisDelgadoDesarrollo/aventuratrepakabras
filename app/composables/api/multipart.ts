export type MultipartFiles = Record<string, File> | File[]

export const appendJsonPart = (
  formData: FormData,
  partName: string,
  payload: unknown
) => {
  formData.append(
    partName,
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  )
}

export const appendFilesPart = (
  formData: FormData,
  files: MultipartFiles = {},
  partName = "files"
) => {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append(partName, file)
    })
    return
  }

  Object.entries(files).forEach(([key, file]) => {
    formData.append(partName, file, key)
  })
}
