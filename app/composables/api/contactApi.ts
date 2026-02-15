import type { ContactRequestDto } from "~/types/contact"
import {apiFetch} from "~/composables/api/apiClient";

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