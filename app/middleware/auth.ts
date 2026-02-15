import type {TokenResponseDto} from "~/types/auth";
import {useAuth} from "~/composables/utils/auth";

export default defineNuxtRouteMiddleware(async () => {
    const { accessToken, setToken } = useAuth()

    if (!accessToken.value) {
        try {
            const config = useRuntimeConfig()

            const response = await $fetch<TokenResponseDto>(
                `${config.public.apiBase}/auth/refresh`,
                {
                    method: "POST",
                    credentials: "include"
                }
            )

            setToken(response.accessToken)

        } catch {
            return navigateTo("/")
        }
    }
})
