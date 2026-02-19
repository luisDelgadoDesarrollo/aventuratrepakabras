import type { CreatePublicationRequestDto, PublicationResponseDto } from "~/types/publications"
import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"
import type { PageResponse } from "~/types/page"

export const getLastPublication = () => {
  return apiFetch<PublicationResponseDto>(clubPath("/publications/last"))
}

export const getPublications = (page: number, size: number) => {
  return apiFetch<PageResponse<PublicationResponseDto>>(clubPath(`/publications?page=${page}&size=${size}`))
}

export const getPublication = (publicationSlug: string) => {
  return apiFetch<PublicationResponseDto>(clubPath(`/publications/${publicationSlug}`))
}
export const deletePublication = async (publicationId: string) => {
  return await apiFetchAuth<void>(clubPath(`/publications/${publicationId}`), {
    method: "DELETE"
  })
}

const buildPublicationFormData = (
  request: CreatePublicationRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = new FormData()

  appendJsonPart(formData, "data", request)
  appendFilesPart(formData, files, "files")

  return formData
}

const sendPublicationForm = async (
  url: string,
  method: "POST" | "PUT",
  request: CreatePublicationRequestDto,
  files: MultipartFiles = {}
) => {
  const formData = buildPublicationFormData(request, files)

  return await apiFetchAuth<void>(url, {
    method,
    body: formData
  })
}

export const createPublication = async (
  request: CreatePublicationRequestDto,
  files: MultipartFiles = {}
) => {
  const url = clubPath("/publications")

  return await sendPublicationForm(url, "POST", request, files)
}

export const updatePublication = async (
  publicationSlug: string,
  request: CreatePublicationRequestDto,
  files: MultipartFiles = {}
) => {
  const url = clubPath(`/publications/${publicationSlug}`)

  return await sendPublicationForm(url, "PUT", request, files)
}
