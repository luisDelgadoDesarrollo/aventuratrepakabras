import { useAuth } from "~/composables/utils/auth"
import type { PdfType } from "~/types/pdf"

export const saveDoc = async (file: File, pdfType: PdfType) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    const formData = new FormData()
    formData.append("file", file)
    formData.append("pdfType", pdfType)

    return await $fetch<void>(`${config.public.apiBase}/clubs/${config.public.clubSlug}/doc`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: formData,
        credentials: "include"
    })
}

export const getDoc = async (pdfType: PdfType) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    return await $fetch<Blob>(`${config.public.apiBase}/clubs/${config.public.clubSlug}/doc`, {
        method: "GET",
        query: { pdfType },
        responseType: "blob",
        headers: accessToken.value
            ? {
                Authorization: `Bearer ${accessToken.value}`
            }
            : undefined,
        credentials: "include"
    })
}
