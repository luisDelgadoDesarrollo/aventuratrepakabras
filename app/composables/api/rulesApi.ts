import type {RuleResponseDto} from "~/types/club";
import {apiFetch} from "~/composables/api/apiClient";
export const getRules = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<RuleResponseDto[]>(
        `/clubs/${config.public.clubSlug}/rules`
    )
}
