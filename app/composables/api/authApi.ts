import type {LoginRequestDto, TokenResponseDto} from "~/types/auth";
import {apiFetch} from "~/composables/api/apiClient";

let refreshPromise: Promise<TokenResponseDto> | null = null

export const login = (payload: LoginRequestDto) => {

    return apiFetch<TokenResponseDto>(
        `/auth/login`,
        {
            method: "POST",
            body: payload
        }
    )
}

export const refresh = async () => {
    if (refreshPromise) return await refreshPromise

    const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined

    refreshPromise = apiFetch<TokenResponseDto>(`/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers
    })

    try {
        return await refreshPromise
    } finally {
        refreshPromise = null
    }
}

export const logout = async () => {
    return await apiFetch<TokenResponseDto>(`/auth/logout`, {
        method: "POST",
        credentials: "include"
    })
}
