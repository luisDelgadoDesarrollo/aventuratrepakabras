import { ref } from "vue"

export function usePagination(initialSize = 10) {
  const pageSize = ref(initialSize)
  const currentPage = ref(0)

  function scrollTop() {
    if (!import.meta.client) return
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  function next(totalPages: number) {
    if (currentPage.value < totalPages - 1) {
      currentPage.value++
      scrollTop()
    }
  }

  function prev() {
    if (currentPage.value > 0) {
      currentPage.value--
      scrollTop()
    }
  }

  return {
    pageSize,
    currentPage,
    next,
    prev
  }
}
