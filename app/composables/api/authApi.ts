import type {LoginRequestDto, TokenResponseDto} from "~/types/auth";
import {apiFetch} from "~/composables/api/apiClient";

export const login = (payload: LoginRequestDto) => {
    const config = useRuntimeConfig()

    return apiFetch<TokenResponseDto>(
        `/auth/login`,
        {
            method: "POST",
            body: payload
        }
    )
}

export const refresh = async () => {
    const config = useRuntimeConfig()

    return await apiFetch<TokenResponseDto>(`/auth/refresh`, {
        method: "POST",
        credentials: "include"
    })
}

