import { apiFetch, apiFetchAuth, clubPath, getAuthHeaders } from "~/composables/api/apiClient"
import type { PdfType } from "~/types/pdf"

export const saveDoc = async (file: File, pdfType: PdfType) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("pdfType", pdfType)

  return await apiFetchAuth<void>(clubPath("/doc"), {
    method: "PUT",
    body: formData
  })
}

export const getDoc = async (pdfType: PdfType) => {
  return await apiFetch<Blob>(clubPath("/doc"), {
    method: "GET",
    query: { pdfType },
    responseType: "blob",
    headers: getAuthHeaders(),
    credentials: "include"
  })
}
