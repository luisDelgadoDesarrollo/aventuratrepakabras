<script setup lang="ts">
import { computed, ref, watch } from "vue"
import CardBase from "~/components/cards/CardBase.vue"
import ImageGallery from "~/components/ImageGallery.vue"
import type { ArticleDto, ArticleVariantDto } from "~/types/articles"

const props = withDefaults(defineProps<{
  article: ArticleDto
  title?: string
  collapsible?: boolean
  showVariants?: boolean
}>(), {
  title: "",
  collapsible: true,
  showVariants: true
})

const selectedSize = ref("")
const selectedColor = ref("")
const quantity = ref(1)

const variants = computed(() => props.article.variants ?? [])

const sizeOptions = computed(() => {
  return [...new Set(variants.value.map((variant) => variant.size).filter(Boolean))]
})

const variantsBySize = computed(() => {
  if (!selectedSize.value) return []
  return variants.value.filter((variant) => variant.size === selectedSize.value)
})

function normalizeColor(value?: string | null) {
  return value?.trim() || "Sin color"
}

const colorOptions = computed(() => {
  return [
    ...new Set(
      variantsBySize.value.map((variant) => normalizeColor(variant.color))
    )
  ]
})

const selectedVariant = computed<ArticleVariantDto | null>(() => {
  if (!selectedSize.value || !selectedColor.value) return null

  return (
    variantsBySize.value.find(
      (variant) => normalizeColor(variant.color) === selectedColor.value
    ) ?? null
  )
})

const maxQuantity = computed(() => {
  if (!selectedVariant.value) return 1
  const stock = Number(selectedVariant.value.stock ?? 0)
  return Number.isFinite(stock) && stock > 0 ? stock : 1
})

watch(
  () => props.article.articleId,
  () => {
    selectedSize.value = sizeOptions.value[0] ?? ""
  },
  { immediate: true }
)

watch(
  selectedSize,
  () => {
    selectedColor.value = colorOptions.value[0] ?? ""
  },
  { immediate: true }
)

watch(
  [selectedColor, maxQuantity],
  () => {
    quantity.value = 1
  },
  { immediate: true }
)
</script>

<template>
  <CardBase :collapsible="collapsible">
    <h2 class="card-title">
      {{ title || article.title }}
    </h2>

    <p class="card-description">
      {{ article.description || "Sin descripcion" }}
    </p>

    <div class="card-meta">
      <span>Variantes: {{ article.variants?.length || 0 }}</span>
      <span>Imagenes: {{ article.imagePath?.length || 0 }}</span>
    </div>

    <ImageGallery :images="article.imagePath || []" />

    <div v-if="showVariants" class="variants-block">
      <h3 class="variants-title">Variantes</h3>

      <p v-if="!article.variants || article.variants.length === 0" class="variants-empty">
        Este articulo no tiene variantes.
      </p>

      <div v-else class="variant-selector-card">
        <div class="selector-grid">
          <label class="selector-field">
            <span>Talla</span>
            <select v-model="selectedSize">
              <option v-for="size in sizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </label>

          <label class="selector-field">
            <span>Color</span>
            <select v-model="selectedColor" :disabled="colorOptions.length === 0">
              <option v-for="color in colorOptions" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </label>

          <label class="selector-field">
            <span>Cantidad</span>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              :max="maxQuantity"
              :disabled="!selectedVariant"
            />
          </label>
        </div>

        <p v-if="selectedVariant" class="variant-stock">
          Stock disponible: {{ selectedVariant.stock ?? "-" }}
        </p>

        <ImageGallery
          v-if="selectedVariant"
          :images="selectedVariant.images || []"
        />
        <ImageGallery
          v-else
          :images="article.imagePath || []"
        />
      </div>
    </div>
  </CardBase>
</template>

<style scoped>
.card-title {
  margin: 0;
  color: var(--color-primary);
}

.card-description {
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.card-meta {
  margin-top: 0.75rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--color-text-secondary);
}

.variants-block {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variants-title {
  margin: 0;
}

.variants-empty {
  margin: 0;
  color: var(--color-text-secondary);
}

.variant-selector-card {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  padding: 1rem;
  background: #f8fafc;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.selector-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.selector-field span {
  font-weight: 600;
}

.selector-field select,
.selector-field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
  background: #fff;
}

.variant-stock {
  margin-top: 0.85rem;
  margin-bottom: 0;
  color: var(--color-text-secondary);
}

:deep(.images-grid) {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}

:deep(.image-item) {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
}

@media (max-width: 900px) {
  .selector-grid {
    grid-template-columns: 1fr;
  }

  :deep(.images-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
</style>
