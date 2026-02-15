import {useAuth} from "~/composables/utils/auth";
import {refresh} from "~/composables/api/authApi";

export default defineNuxtRouteMiddleware(async () => {
    const { accessToken, setToken } = useAuth()

    if (!accessToken.value) {
        if (import.meta.server) {
            // Avoid false logout on SSR refresh-token races/proxy cookie issues.
            return
        }
        try {
            const response = await refresh()
            setToken(response.accessToken)
        } catch {
            return navigateTo("/")
        }
    }
})
