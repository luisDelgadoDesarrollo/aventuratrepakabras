import type { ImageRequestDto } from "~/types/images"
import type { UsResponseDto } from "~/types/club"
import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"

export const getUs = () => {
  return apiFetch<UsResponseDto>(clubPath("/us"))
}

export interface UsRequestDto {
    text: string
    images: ImageRequestDto[]
}

const buildUsFormData = (
  request: UsRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = new FormData()

  appendJsonPart(formData, "us", request)
  appendFilesPart(formData, files, "files")

  return formData
}

const sendUsForm = async (
  method: "POST" | "PUT",
  request: UsRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = buildUsFormData(request, files)

  return await apiFetchAuth<void>(clubPath("/us"), {
    method,
    body: formData
  })
}

export const createUs = async (
  request: UsRequestDto,
  files: MultipartFiles = {}
) => {
  return await sendUsForm("POST", request, files)
}

export const updateUs = async (
  request: UsRequestDto,
  files: MultipartFiles = {}
) => {
  return await sendUsForm("PUT", request, files)
}
