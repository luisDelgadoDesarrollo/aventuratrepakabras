export const useAuth = () => {
    const accessToken = useState<string | null>("access_token", () => null)

    const setToken = (token: string) => {
        accessToken.value = token
    }

    const clearToken = () => {
        accessToken.value = null
    }

    return {
        accessToken,
        setToken,
        clearToken
    }
}