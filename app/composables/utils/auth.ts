import {logout} from "~/composables/api/authApi";

export const useAuth = () => {
    const accessToken = useState<string | null>("access_token", () => null)

    const setToken = (token: string) => {
        accessToken.value = token
    }

    const clearToken = async () => {
        accessToken.value = null
        await logout()
    }

    return {
        accessToken,
        setToken,
        clearToken
    }
}