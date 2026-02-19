import { apiFetch } from "~/composables/api/apiClient"
import { useAuth } from "~/composables/utils/auth"
import type { CreateClubUserDto, ClubUserDto } from "~/types/users"
import type { PageResponse } from "~/types/page"

export const getClubUsers = (page: number, size: number) => {
  const config = useRuntimeConfig()

  return apiFetch<PageResponse<ClubUserDto>>(
    `/clubs/${config.public.clubSlug}/users?page=${page}&size=${size}&sort=createdAt,desc`
  )
}

export const createClubUser = (payload: CreateClubUserDto) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  return apiFetch<void>(
    `/clubs/${config.public.clubSlug}/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: payload,
      credentials: "include"
    }
  )
}

export const updateClubUser = (email: string, payload: CreateClubUserDto) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  return apiFetch<void>(
    `/clubs/${config.public.clubSlug}/users/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: payload,
      credentials: "include"
    }
  )
}

export const deleteClubUser = (email: string) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  return apiFetch<void>(
    `/clubs/${config.public.clubSlug}/users/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      credentials: "include"
    }
  )
}
