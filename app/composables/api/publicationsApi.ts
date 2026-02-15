import type {CreatePublicationRequestDto, PublicationResponseDto} from "~/types/publications";
import {apiFetch} from "~/composables/api/apiClient";
import type {PageResponse} from "~/types/page";
import {useAuth} from "~/composables/utils/auth";
export const getLastPublication = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<PublicationResponseDto>(
        `/clubs/${config.public.clubSlug}/publications/last`
    )
}

export const getPublications = (page: number, size: number) => {
    const config = useRuntimeConfig()

    return apiFetch<PageResponse<PublicationResponseDto>>(
        `/clubs/${config.public.clubSlug}/publications?page=${page}&size=${size}`
    )
}

export const getPublication = (publicationSlug: string) => {
    const config = useRuntimeConfig()

    return apiFetch<PublicationResponseDto>(
        `/clubs/${config.public.clubSlug}/publications/${publicationSlug}`
    )
}
export const deletePublication = async (publicationId: string) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    return await $fetch(
        `${config.public.apiBase}/clubs/${config.public.clubSlug}/publications/${publicationId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            },
            credentials: "include"
        }
    )
}

const buildPublicationFormData = (
    request: CreatePublicationRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const formData = new FormData()

    formData.append(
        "data",
        new Blob([JSON.stringify(request)], { type: "application/json" })
    )

    if (Array.isArray(files)) {
        files.forEach((file) => {
            formData.append("files", file)
        })
    } else {
        Object.entries(files).forEach(([key, file]) => {
            // Keep "files" as multipart field and use image-* as filename.
            formData.append("files", file, key)
        })
    }

    return formData
}

const sendPublicationForm = async (
    url: string,
    method: "POST" | "PUT",
    request: CreatePublicationRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const { accessToken } = useAuth()
    const formData = buildPublicationFormData(request, files)

    return await $fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: formData,
        credentials: "include"
    })
}

export const createPublication = async (
    request: CreatePublicationRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const config = useRuntimeConfig()
    const url = `${config.public.apiBase}/clubs/${config.public.clubSlug}/publications`

    return await sendPublicationForm(url, "POST", request, files)
}

export const updatePublication = async (
    publicationSlug: string,
    request: CreatePublicationRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const config = useRuntimeConfig()
    const url = `${config.public.apiBase}/clubs/${config.public.clubSlug}/publications/${publicationSlug}`

    return await sendPublicationForm(url, "PUT", request, files)
}
