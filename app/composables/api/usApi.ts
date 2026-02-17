import type {ImageRequestDto} from "~/types/images";
import type {UsResponseDto} from "~/types/club";
import {apiFetch} from "~/composables/api/apiClient";
import {appendFilesPart, appendJsonPart, type MultipartFiles} from "~/composables/api/multipart";
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
