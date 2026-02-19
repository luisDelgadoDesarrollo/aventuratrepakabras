import { getClubIban } from "~/composables/api/clubApi"

export const useClubIban = () => {
  const iban = useState<string | null>("club_iban", () => null)
  const isLoading = useState<boolean>("club_iban_loading", () => false)
  const error = useState<string>("club_iban_error", () => "")

  const load = async (force = false) => {
    if (isLoading.value) return iban.value
    if (iban.value && !force) return iban.value

    isLoading.value = true
    error.value = ""

    try {
      const config = useRuntimeConfig()
      iban.value = await getClubIban(String(config.public.clubSlug))
      return iban.value
    } catch (err) {
      console.error("No se pudo cargar el IBAN del club:", err)
      error.value = "No se pudo cargar el IBAN."
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    iban,
    isLoading,
    error,
    load
  }
}
