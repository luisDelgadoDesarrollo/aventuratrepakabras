import type {UsResponseDto} from "~/types/club";
import {apiFetch} from "~/composables/api/apiClient";
export const getUs = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<UsResponseDto>(
        `/clubs/${config.public.clubSlug}/us`
    )
}
