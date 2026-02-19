<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import ImageForm from "~/components/forms/imageForm.vue"
import { createArticle, updateArticle } from "~/composables/api/articlesApi"
import { bumpImagesVersion, getImageUrl } from "~/composables/api/imgApi"
import type { ImageFormItem } from "~/types/forms"
import type { ArticleDto, CreateArticleRequestDto, CreateArticleVariantDto, ImageRequestDto } from "~/types/articles"

interface ArticleVariantFormItem {
  clientId: string
  size: string
  color: string
  stock: number | null
  images: ImageFormItem[]
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  mode?: "create" | "edit"
  article?: ArticleDto | null
}>(), {
  mode: "create",
  article: null
})

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "saved"): void
}>()

const articleForm = reactive<{
  title: string
  description: string
  images: ImageFormItem[]
  variants: ArticleVariantFormItem[]
}>({
  title: "",
  description: "",
  images: [],
  variants: []
})

const isSubmitting = ref(false)
const isEditMode = computed(() => props.mode === "edit")
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function createImageItem(
  imageName: string,
  description = "",
  existing = false,
  sourcePath: string | null = null
): ImageFormItem {
  return {
    clientId: createClientId(),
    image: imageName,
    description,
    file: null,
    existing,
    sourcePath
  }
}

function createVariantItem(): ArticleVariantFormItem {
  return {
    clientId: createClientId(),
    size: "",
    color: "",
    stock: null,
    images: [createImageItem("image-1")]
  }
}

function resetForm() {
  articleForm.title = ""
  articleForm.description = ""
  articleForm.images.splice(0)
  articleForm.variants.splice(0)
}

function setFormFromArticle(article: ArticleDto) {
  articleForm.title = article.title ?? ""
  articleForm.description = article.description ?? ""

  articleForm.images.splice(0)
  ;(article.imagePath ?? []).forEach((imagePath, index) => {
    articleForm.images.push(createImageItem(`image-${index + 1}`, "", true, imagePath))
  })

  articleForm.variants.splice(0)
  ;(article.variants ?? []).forEach((variant, variantIndex) => {
    const variantForm: ArticleVariantFormItem = {
      clientId: createClientId(),
      size: variant.size ?? "",
      color: variant.color ?? "",
      stock: variant.stock ?? null,
      images: []
    }

    ;(variant.images ?? []).forEach((imagePath, imageIndex) => {
      variantForm.images.push(
        createImageItem(`image-${imageIndex + 1}`, "", true, imagePath)
      )
    })

    if (variantForm.images.length === 0) {
      variantForm.images.push(createImageItem(`image-${variantIndex + 1}`))
    }

    articleForm.variants.push(variantForm)
  })
}

function getFileExtension(path: string) {
  const cleanPath = path.split("?")[0]
  const lastDotIndex = cleanPath.lastIndexOf(".")
  if (lastDotIndex === -1) return ""
  return cleanPath.slice(lastDotIndex)
}

function close() {
  emit("update:modelValue", false)
}

function addVariant() {
  articleForm.variants.push(createVariantItem())
}

function removeVariant(clientId: string) {
  const index = articleForm.variants.findIndex((item) => item.clientId === clientId)
  if (index === -1) return
  articleForm.variants.splice(index, 1)
}

async function buildImagePayload(
  items: ImageFormItem[],
  keyPrefix: string,
  filesPayload: Record<string, File>
): Promise<ImageRequestDto[]> {
  const orderedItems = items.filter((item) => item.existing || item.file)

  const payload: ImageRequestDto[] = []

  for (let index = 0; index < orderedItems.length; index += 1) {
    const item = orderedItems[index]
    const imageKey = `${keyPrefix}-image-${index + 1}`

    payload.push({
      image: imageKey,
      description: item.description || undefined
    })

    if (item.file) {
      filesPayload[imageKey] = item.file
      continue
    }

    if (item.existing && item.sourcePath) {
      const response = await fetch(getImageUrl(item.sourcePath), { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`No se pudo recuperar la imagen existente ${imageKey}`)
      }

      const blob = await response.blob()
      const extension = getFileExtension(item.sourcePath)
      filesPayload[imageKey] = new File([blob], `${imageKey}${extension}`, {
        type: blob.type || "application/octet-stream"
      })
    }
  }

  return payload
}

async function handleSave() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const filesPayload: Record<string, File> = {}
    const articleImagesPayload = await buildImagePayload(articleForm.images, "article", filesPayload)

    const variantsPayload: CreateArticleVariantDto[] = []

    for (let variantIndex = 0; variantIndex < articleForm.variants.length; variantIndex += 1) {
      const variant = articleForm.variants[variantIndex]
      const variantImagesPayload = await buildImagePayload(
        variant.images,
        `variant-${variantIndex + 1}`,
        filesPayload
      )

      variantsPayload.push({
        size: variant.size,
        color: variant.color || undefined,
        stock: variant.stock == null ? undefined : Number(variant.stock),
        images: variantImagesPayload
      })
    }

    const request: CreateArticleRequestDto = {
      title: articleForm.title,
      description: articleForm.description || undefined,
      images: articleImagesPayload,
      variants: variantsPayload
    }

    if (isEditMode.value && props.article) {
      await updateArticle(props.article.slug, request, filesPayload)
    } else {
      await createArticle(request, filesPayload)
    }

    bumpImagesVersion()
    close()
    resetForm()
    emit("saved")
  } catch (error) {
    console.error("Error guardando articulo:", error)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (isEditMode.value && props.article) {
        setFormFromArticle(props.article)
      } else {
        resetForm()
        articleForm.images.push(createImageItem("image-1"))
        articleForm.variants.push(createVariantItem())
      }
    }

    if (!value) {
      resetForm()
    }
  }
)
</script>

<template>
  <BaseDialog v-model="isOpen">
    <div class="admin-dialog-header">
      <h2>{{ isEditMode ? "Editar articulo" : "Crear articulo" }}</h2>
    </div>

    <form class="admin-form article-form" @submit.prevent="handleSave">
      <div class="admin-form-group">
        <label for="article-title">Titulo</label>
        <input
          id="article-title"
          v-model="articleForm.title"
          type="text"
          placeholder="Titulo"
          required
        />
      </div>

      <div class="admin-form-group">
        <label for="article-description">Descripcion</label>
        <textarea
          id="article-description"
          v-model="articleForm.description"
          rows="3"
          placeholder="Descripcion"
        />
      </div>

      <ImageForm
        v-model="articleForm.images"
        title="Imagenes del articulo"
        add-label="+ Imagen"
        empty-hint="Anade imagenes del articulo."
        id-prefix="article-image"
      />

      <div class="variants-section">
        <div class="variants-header">
          <h3>Variantes</h3>
          <button type="button" class="action-btn edit-new-btn" @click="addVariant">
            + Variante
          </button>
        </div>

        <p v-if="articleForm.variants.length === 0" class="variants-empty">
          No hay variantes. Anade al menos una.
        </p>

        <div v-for="(variant, index) in articleForm.variants" :key="variant.clientId" class="variant-card">
          <div class="variant-card-header">
            <h4>Variante {{ index + 1 }}</h4>
            <button type="button" class="action-btn delete-btn" @click="removeVariant(variant.clientId)">
              Borrar
            </button>
          </div>

          <div class="admin-form-row two-columns">
            <div class="admin-form-group">
              <label :for="`variant-size-${variant.clientId}`">Talla</label>
              <input
                :id="`variant-size-${variant.clientId}`"
                v-model="variant.size"
                type="text"
                placeholder="M"
                required
              />
            </div>

            <div class="admin-form-group">
              <label :for="`variant-color-${variant.clientId}`">Color</label>
              <input
                :id="`variant-color-${variant.clientId}`"
                v-model="variant.color"
                type="text"
                placeholder="Rojo"
              />
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label :for="`variant-stock-${variant.clientId}`">Stock</label>
              <input
                :id="`variant-stock-${variant.clientId}`"
                v-model.number="variant.stock"
                type="number"
                min="0"
                step="1"
              />
            </div>
          </div>

          <ImageForm
            v-model="variant.images"
            title="Imagenes de la variante"
            add-label="+ Imagen"
            empty-hint="Anade imagenes para esta variante."
            :id-prefix="`article-variant-image-${variant.clientId}`"
          />
        </div>
      </div>

      <div class="admin-form-actions">
        <button type="submit" class="primary-btn" :disabled="isSubmitting">
          {{ isEditMode ? "Guardar cambios" : "Guardar" }}
        </button>
        <button type="button" class="action-btn delete-btn" @click="close">
          Cancelar
        </button>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.article-form {
  gap: 1.25rem;
}

.variants-section {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variants-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.variants-header h3 {
  margin: 0;
}

.variants-empty {
  margin: 0;
  color: var(--color-placeholder);
}

.variant-card {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
}

.variant-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.variant-card-header h4 {
  margin: 0;
}
</style>
