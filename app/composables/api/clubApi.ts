import { apiFetch } from "~/composables/api/apiClient"

export const getClubIban = (clubSlug: string) => {
  return apiFetch<string>(`/clubs/${encodeURIComponent(clubSlug)}/iban`)
}
