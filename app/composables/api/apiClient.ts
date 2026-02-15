export const apiFetch = <T>(url: string, options?: any) => {
    const config = useRuntimeConfig()

    const baseURL = import.meta.server
        ? config.apiBaseServer
        : config.public.apiBase

    return $fetch<T>(`${baseURL}${url}`, options)
}
