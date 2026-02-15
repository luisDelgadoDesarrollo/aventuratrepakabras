import type {RuleResponseDto} from "~/types/club";
import {apiFetch} from "~/composables/api/apiClient";
import {useAuth} from "~/composables/utils/auth";
export const getRules = () =>
{
    const config = useRuntimeConfig()
    return apiFetch<RuleResponseDto[]>(
        `/clubs/${config.public.clubSlug}/rules`
    )
}

export const updateRules = async (rules: string[]) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    return await $fetch<RuleResponseDto[]>(
        `${config.public.apiBase}/clubs/${config.public.clubSlug}/rules`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            },
            body: rules,
            credentials: "include"
        }
    )
}
