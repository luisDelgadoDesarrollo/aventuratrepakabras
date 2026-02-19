import { ref } from "vue"

interface CrudDialogOptions<TItem, TEditItem = TItem> {
  loadForEdit?: (item: TItem) => Promise<TEditItem>
  cloneForEdit?: (item: TItem) => TEditItem
  onEditError?: (error: unknown) => void
}

export function useCrudDialogs<TItem, TEditItem = TItem>(options: CrudDialogOptions<TItem, TEditItem> = {}) {
  const selectedItem = ref<TItem | null>(null)
  const editItem = ref<TEditItem | null>(null)
  const viewModal = ref(false)
  const createModal = ref(false)
  const isLoadingEdit = ref(false)

  function openView(item: TItem) {
    selectedItem.value = item
    viewModal.value = true
  }

  function openCreate() {
    editItem.value = null
    createModal.value = true
  }

  async function openEdit(item: TItem) {
    isLoadingEdit.value = true
    try {
      if (options.loadForEdit) {
        editItem.value = await options.loadForEdit(item)
      } else if (options.cloneForEdit) {
        editItem.value = options.cloneForEdit(item)
      } else {
        editItem.value = item as unknown as TEditItem
      }
      createModal.value = true
    } catch (error) {
      options.onEditError?.(error)
    } finally {
      isLoadingEdit.value = false
    }
  }

  return {
    selectedItem,
    editItem,
    viewModal,
    createModal,
    isLoadingEdit,
    openView,
    openCreate,
    openEdit
  }
}
