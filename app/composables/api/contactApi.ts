import type { ActivityRegistrationRequestDto, ClubContactDto, ContactRequestDto } from "~/types/contact"
import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"

export const getContact = () => {
  return apiFetch<ClubContactDto>(clubPath("/contactInfo"))
}

export const updateContact = (payload: ClubContactDto) => {
  return apiFetchAuth<void>(
    clubPath("/contactInfo"),
    {
      method: "PUT",
      body: payload
    }
  )
}

export const sendContactMessage = (payload: ContactRequestDto) => {
  return apiFetch<void>(
    clubPath("/contact/message"),
    {
      method: "POST",
      body: payload
    }
  )
}

export const sendMembershipRequest = (signUp: File, receipt: File) => {
  const formData = new FormData()
  formData.append("signUp", signUp)
  formData.append("receipt", receipt)

  return apiFetch<void>(
    clubPath("/contact/memberShipRequest"),
    {
      method: "POST",
      body: formData
    }
  )
}

export const sendFederationRequest = (signUp: File) => {
  const formData = new FormData()
  formData.append("signUp", signUp)

  return apiFetch<void>(
    clubPath("/contact/federation"),
    {
      method: "POST",
      body: formData
    }
  )
}

export const sendActivityRegistration = (
  clubSlug: string,
  activitySlug: string,
  payload: ActivityRegistrationRequestDto,
  receipt: File
) => {
  const formData = new FormData()
  formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }))
  formData.append("receipt", receipt)

  return apiFetch<void>(
    `/clubs/${encodeURIComponent(clubSlug)}/contact/activity/${encodeURIComponent(activitySlug)}`,
    {
      method: "POST",
      body: formData
    }
  )
}
