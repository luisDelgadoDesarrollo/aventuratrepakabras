import type { ClubContactDto, ContactRequestDto } from "~/types/contact"
import { apiFetch } from "~/composables/api/apiClient"
import { useAuth } from "~/composables/utils/auth"

export const getContact = () => {
    const config = useRuntimeConfig()
    return apiFetch<ClubContactDto>(`/clubs/${config.public.clubSlug}/contactInfo`)
}

export const updateContact = (payload: ClubContactDto) => {
    const config = useRuntimeConfig()
    const { accessToken } = useAuth()

    return apiFetch<void>(
        `/clubs/${config.public.clubSlug}/contactInfo`,
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

export const sendContactMessage = (payload: ContactRequestDto) => {
    const config = useRuntimeConfig()

    return apiFetch(
        `/clubs/${config.public.clubSlug}/contact/message`,
        {
            method: "POST",
            body: payload
        }
    )
}

export const sendMembershipRequest = (signUp: File, receipt: File) => {
    const config = useRuntimeConfig()
    const formData = new FormData()
    formData.append("signUp", signUp)
    formData.append("receipt", receipt)

    return apiFetch<void>(
        `/clubs/${config.public.clubSlug}/contact/memberShipRequest`,
        {
            method: "POST",
            body: formData
        }
    )
}

export const sendFederationRequest = (signUp: File) => {
    const config = useRuntimeConfig()
    const formData = new FormData()
    formData.append("signUp", signUp)

    return apiFetch<void>(
        `/clubs/${config.public.clubSlug}/contact/federation`,
        {
            method: "POST",
            body: formData
        }
    )
}
