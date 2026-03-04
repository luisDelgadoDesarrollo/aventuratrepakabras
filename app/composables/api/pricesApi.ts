import type { PriceDto } from "~/types/club"
import { apiFetch, apiFetchAuth, clubPath } from "~/composables/api/apiClient"

export const getPrices = () => {
  return apiFetch<PriceDto[]>(clubPath("/prices"))
}

export const updatePrices = async (prices: PriceDto[]) => {
  return await apiFetchAuth<void>(clubPath("/prices"), {
    method: "PUT",
    body: prices
  })
}
