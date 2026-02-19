import type { RuleResponseDto } from "~/types/club"
import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"

export const getRules = () => {
  return apiFetch<RuleResponseDto[]>(clubPath("/rules"))
}

export const updateRules = async (rules: string[]) => {
  return await apiFetchAuth<RuleResponseDto[]>(clubPath("/rules"), {
    method: "PUT",
    body: rules
  })
}
