export interface ImageFormItem {
  clientId: string
  image: string
  description: string
  file: File | null
  existing: boolean
  sourcePath: string | null
}
