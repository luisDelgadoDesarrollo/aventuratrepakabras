import type {ActivityResponseDto} from "~/types/activities";
import {apiFetch} from "~/composables/api/apiClient";
export const getLastActivity = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<ActivityResponseDto>(
        `/clubs/${config.public.clubSlug}/activities/last`
    )
}
