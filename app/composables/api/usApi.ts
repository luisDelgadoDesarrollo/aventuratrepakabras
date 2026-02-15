import type {ImageRequestDto} from "~/types/images";
import type {UsResponseDto} from "~/types/club";
import {apiFetch} from "~/composables/api/apiClient";
import {useAuth} from "~/composables/utils/auth";
export const getUs = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<UsResponseDto>(
        `/clubs/${config.public.clubSlug}/us`
    )
}

export interface UsRequestDto {
    text: string
    images: ImageRequestDto[]
}

const buildUsFormData = (
    request: UsRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const formData = new FormData()

    formData.append(
        "us",
        new Blob([JSON.stringify(request)], { type: "application/json" })
    )

    if (Array.isArray(files)) {
        files.forEach((file) => {
            formData.append("files", file)
        })
    } else {
        Object.entries(files).forEach(([key, file]) => {
            // Backend expects @RequestPart("files") List<MultipartFile>.
            // Keep "files" as part name and send image-* as multipart filename.
            formData.append("files", file, key)
        })
    }

    return formData
}

const sendUsForm = async (
    method: "POST" | "PUT",
    request: UsRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()
    const formData = buildUsFormData(request, files)

    return await $fetch(`${config.public.apiBase}/clubs/${config.public.clubSlug}/us`, {
        method,
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: formData,
        credentials: "include"
    })
}

export const createUs = async (
    request: UsRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    return await sendUsForm("POST", request, files)
}

export const updateUs = async (
    request: UsRequestDto,
    files: Record<string, File> | File[] = {}
) => {
    return await sendUsForm("PUT", request, files)
}
