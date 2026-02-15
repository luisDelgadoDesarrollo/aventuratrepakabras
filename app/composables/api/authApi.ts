import type {LoginRequestDto, TokenResponseDto} from "~/types/auth";
import {apiFetch} from "~/composables/api/apiClient";

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

    return await apiFetch<TokenResponseDto>(`/auth/refresh`, {
        method: "POST",
        credentials: "include"
    })
}

export const logout = async () => {
    return await apiFetch<TokenResponseDto>(`/auth/logout`, {
        method: "POST",
        credentials: "include"
    })
}

