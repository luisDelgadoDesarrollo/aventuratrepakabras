import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"
import { appendFilesPart, appendJsonPart, type MultipartFiles } from "~/composables/api/multipart"
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
  return apiFetch<ActivityResponseDto>(clubPath("/activities/last"))
}

export const getActivity = (activityId: number | string) => {
  return apiFetch<ActivityResponseDto>(clubPath(`/activities/${activityId}`))
}

export const getActivities = (params?: {
  page?: number
  size?: number
  sort?: string
}) => {
  const query = new URLSearchParams()

  if (typeof params?.page === "number") query.set("page", String(params.page))
  if (typeof params?.size === "number") query.set("size", String(params.size))
  if (params?.sort) query.set("sort", params.sort)

  const suffix = query.toString() ? `?${query.toString()}` : ""

  return apiFetch<ActivityResponseDto[]>(clubPath(`/activities${suffix}`))
}

export const getActivityYears = () => {
  return apiFetch<number[]>(clubPath("/activities/years"))
}

export const getActivitiesByYear = (year: number | string) => {
  return apiFetch<ActivityResponseDto[]>(clubPath(`/activities/years/${year}`))
}

export const createActivity = async (
  activity: Record<string, unknown>,
  files: MultipartFiles = {}
) => {
  const formData = buildActivityFormData(activity, files)

  return await apiFetchAuth<ActivityUpsertResponseDto>(
    clubPath("/activities"),
    {
      method: "POST",
      body: formData
    }
  )
}

export const updateActivity = async (
  activityId: number | string,
  activity: Record<string, unknown>,
  files: MultipartFiles = {}
) => {
  const formData = buildActivityFormData(activity, files)

  return await apiFetchAuth<ActivityUpsertResponseDto>(
    clubPath(`/activities/${activityId}`),
    {
      method: "PUT",
      body: formData
    }
  )
}

export const deleteActivity = async (activityId: number | string) => {
  return await apiFetchAuth<void>(
    clubPath(`/activities/${activityId}`),
    {
      method: "DELETE"
    }
  )
}
