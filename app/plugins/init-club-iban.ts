import { useClubIban } from "~/composables/state/useClubIban"

export default defineNuxtPlugin(async () => {
  const { load } = useClubIban()
  await load()
})
