import { apiFetch } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"
import { useAuth } from "~/composables/utils/auth"
import type { ActivityResponseDto } from "~/types/activities"

export interface ActivityUpsertResponseDto {
  id: number
}

const buildActivityFormData = (
  activity: Record<string, unknown>,
  files: MultipartFiles = {}
) => {
  const formData = new FormData()
  appendJsonPart(formData, "data", activity)
  appendFilesPart(formData, files, "files")

  return formData
}

export const getLastActivity = () => {
  const config = useRuntimeConfig()

  return apiFetch<ActivityResponseDto>(
    `/clubs/${config.public.clubSlug}/activities/last`
  )
}

export const getActivity = (activityId: number | string) => {
  const config = useRuntimeConfig()

  return apiFetch<ActivityResponseDto>(
    `/clubs/${config.public.clubSlug}/activities/${activityId}`
  )
}

export const getActivities = (params?: {
  page?: number
  size?: number
  sort?: string
}) => {
  const config = useRuntimeConfig()
  const query = new URLSearchParams()

  if (typeof params?.page === "number") query.set("page", String(params.page))
  if (typeof params?.size === "number") query.set("size", String(params.size))
  if (params?.sort) query.set("sort", params.sort)

  const suffix = query.toString() ? `?${query.toString()}` : ""

  return apiFetch<ActivityResponseDto[]>(
    `/clubs/${config.public.clubSlug}/activities${suffix}`
  )
}

export const getActivityYears = () => {
  const config = useRuntimeConfig()

  return apiFetch<number[]>(
    `/clubs/${config.public.clubSlug}/activities/years`
  )
}

export const getActivitiesByYear = (year: number | string) => {
  const config = useRuntimeConfig()

  return apiFetch<ActivityResponseDto[]>(
    `/clubs/${config.public.clubSlug}/activities/years/${year}`
  )
}

export const createActivity = async (
  activity: Record<string, unknown>,
  files: MultipartFiles = {}
) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()
  const formData = buildActivityFormData(activity, files)

  return await $fetch<ActivityUpsertResponseDto>(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/activities`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: formData,
      credentials: "include"
    }
  )
}

export const updateActivity = async (
  activityId: number | string,
  activity: Record<string, unknown>,
  files: MultipartFiles = {}
) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()
  const formData = buildActivityFormData(activity, files)

  return await $fetch<ActivityUpsertResponseDto>(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/activities/${activityId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: formData,
      credentials: "include"
    }
  )
}

export const deleteActivity = async (activityId: number | string) => {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()

  return await $fetch<void>(
    `${config.public.apiBase}/clubs/${config.public.clubSlug}/activities/${activityId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      credentials: "include"
    }
  )
}
