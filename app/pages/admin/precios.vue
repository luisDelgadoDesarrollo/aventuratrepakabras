<script setup lang="ts">
import { ref } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import { getPrices, updatePrices } from "~/composables/api/pricesApi"
import type { PriceDto } from "~/types/club"

definePageMeta({
  middleware: "auth"
})

const editModal = ref(false)
const isSaving = ref(false)
const saveError = ref("")
const pricesDraft = ref<PriceDto[]>([])

const { data: prices, pending, refresh } = await useAsyncData<PriceDto[]>(
  "admin-prices",
  () => getPrices(),
  {
    default: () => []
  }
)

const euroFormat = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
})

function formatPrice(value: string | number) {
  const parsed = parseNumericPrice(value)
  return parsed === null ? "-" : euroFormat.format(parsed)
}

function parseNumericPrice(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  const normalized = value.replace(",", ".").trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function openEdit() {
  pricesDraft.value = (prices.value ?? []).map((item) => ({
    title: item.title,
    price: String(item.price ?? "")
  }))

  if (pricesDraft.value.length === 0) {
    pricesDraft.value.push({ title: "", price: "" })
  }

  saveError.value = ""
  editModal.value = true
}

function addPrice() {
  pricesDraft.value.push({ title: "", price: "" })
}

function removePrice(index: number) {
  pricesDraft.value.splice(index, 1)
  if (pricesDraft.value.length === 0) {
    pricesDraft.value.push({ title: "", price: "" })
  }
}

async function savePrices() {
  if (isSaving.value) return

  const cleanPrices: PriceDto[] = []
  for (const item of pricesDraft.value) {
    const title = item.title.trim()
    const amount = parseNumericPrice(item.price)

    if (!title) continue
    if (amount === null) {
      saveError.value = "Todos los precios deben tener un importe valido."
      return
    }

    cleanPrices.push({
      title,
      price: amount
    })
  }

  if (cleanPrices.length === 0) {
    saveError.value = "Debes indicar al menos un precio."
    return
  }

  isSaving.value = true
  saveError.value = ""

  try {
    await updatePrices(cleanPrices)
    editModal.value = false
    await refresh()
  } catch (error) {
    console.error("Error actualizando precios:", error)
    saveError.value = "No se han podido actualizar los precios."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="prices-admin-page">
    <div class="page-header">
      <h1 class="page-title">Precios</h1>
      <button class="action-btn edit-new-btn" @click="openEdit">
        Editar
      </button>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th>#</th>
          <th>Concepto</th>
          <th>Precio</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="pending">
          <td colspan="3">Cargando precios...</td>
        </tr>
        <tr v-else-if="!prices || prices.length === 0">
          <td colspan="3">No hay precios configurados.</td>
        </tr>
        <template v-else>
          <tr v-for="(price, index) in prices" :key="`${price.title}-${index}`">
            <td>{{ index + 1 }}</td>
            <td>{{ price.title }}</td>
            <td>{{ formatPrice(price.price) }}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

    <BaseDialog v-model="editModal">
      <div class="dialog-header">
        <h2>Editar precios</h2>
        <button type="button" class="action-btn edit-new-btn" @click="addPrice">
          + Precio
        </button>
      </div>

      <form class="prices-form" @submit.prevent="savePrices">
        <div
          v-for="(price, index) in pricesDraft"
          :key="index"
          class="price-row"
        >
          <label :for="`title-${index}`">Concepto {{ index + 1 }}</label>
          <input
            :id="`title-${index}`"
            v-model="pricesDraft[index].title"
            type="text"
            placeholder="Ej: Socio adulto 18-75"
          />

          <label :for="`price-${index}`">Importe (EUR)</label>
          <div class="amount-row">
            <input
              :id="`price-${index}`"
              v-model="pricesDraft[index].price"
              type="text"
              inputmode="decimal"
              placeholder="Ej: 20"
            />
            <button
              type="button"
              class="action-btn delete-btn"
              @click="removePrice(index)"
            >
              Borrar
            </button>
          </div>
        </div>

        <p v-if="saveError" class="error-message">{{ saveError }}</p>

        <div class="form-actions">
          <button type="submit" class="action-btn edit-new-btn" :disabled="isSaving">
            {{ isSaving ? "Guardando..." : "Guardar cambios" }}
          </button>
          <button type="button" class="action-btn" @click="editModal = false">
            Cancelar
          </button>
        </div>
      </form>
    </BaseDialog>
  </section>
</template>

<style scoped>
.prices-admin-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.page-title {
  margin: 0;
  color: var(--color-primary);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.prices-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
}

.price-row label {
  font-weight: 600;
}

.price-row input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
}

.amount-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.error-message {
  color: #b91c1c;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .amount-row {
    grid-template-columns: 1fr;
  }
}
</style>
