import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"
import type { CreateClubUserDto, ClubUserDto } from "~/types/users"
import type { PageResponse } from "~/types/page"

export const getClubUsers = (page: number, size: number) => {
  return apiFetch<PageResponse<ClubUserDto>>(
    clubPath(`/users?page=${page}&size=${size}&sort=createdAt,desc`)
  )
}

export const createClubUser = (payload: CreateClubUserDto) => {
  return apiFetchAuth<void>(
    clubPath("/users"),
    {
      method: "POST",
      body: payload
    }
  )
}

export const updateClubUser = (email: string, payload: CreateClubUserDto) => {
  console.log(payload)
    return apiFetchAuth<void>(
    clubPath(`/users/${encodeURIComponent(email)}`),
    {
      method: "PUT",
      body: payload
    }
  )
}

export const deleteClubUser = (email: string) => {
  return apiFetchAuth<void>(
    clubPath(`/users/${encodeURIComponent(email)}`),
    {
      method: "DELETE"
    }
  )
}
