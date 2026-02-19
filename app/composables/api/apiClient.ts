import { useAuth } from "~/composables/utils/auth"

type ApiFetchOptions = Record<string, unknown> & {
  headers?: Record<string, string>
}

export const apiFetch = <T>(url: string, options?: ApiFetchOptions) => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server
    ? config.apiBaseServer
    : config.public.apiBase

  return $fetch<T>(`${baseURL}${url}`, options)
}

export const getClubBasePath = () => {
  const config = useRuntimeConfig()
  return `/clubs/${config.public.clubSlug}`
}

export const clubPath = (path = "") => `${getClubBasePath()}${path}`

export const getAuthHeaders = () => {
  const { accessToken } = useAuth()
  if (!accessToken.value) return undefined
  return {
    Authorization: `Bearer ${accessToken.value}`
  }
}

export const apiFetchAuth = <T>(url: string, options?: ApiFetchOptions) => {
  const headers = {
    ...(options?.headers ?? {}),
    ...(getAuthHeaders() ?? {})
  }

  return apiFetch<T>(url, {
    ...options,
    headers,
    credentials: "include"
  })
}
