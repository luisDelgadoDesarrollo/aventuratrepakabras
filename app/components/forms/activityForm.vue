<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import ImageForm from "~/components/forms/imageForm.vue"
import { createActivity, updateActivity } from "~/composables/api/activitiesApi"
import type { ActivityResponseDto, CreateActivityRequestDto } from "~/types/activities"
import { bumpImagesVersion, getImageUrl } from "~/composables/api/imgApi"
import type { ImageFormItem } from "~/types/forms"

const props = withDefaults(defineProps<{
  modelValue: boolean
  mode?: "create" | "edit"
  activity?: ActivityResponseDto | null
}>(), {
  mode: "create",
  activity: null
})

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "saved"): void
}>()

const activityForm = reactive<{
  title: string
  description: string
  affiliatePrice: number | null
  noAffiliatePrice: number | null
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  images: ImageFormItem[]
}>({
  title: "",
  description: "",
  affiliatePrice: null,
  noAffiliatePrice: null,
  startDate: "",
  startTime: "00:00",
  endDate: "",
  endTime: "00:00",
  images: []
})

const isSubmitting = ref(false)
const isEditMode = computed(() => props.mode === "edit")
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

function resetForm() {
  activityForm.title = ""
  activityForm.description = ""
  activityForm.affiliatePrice = null
  activityForm.noAffiliatePrice = null
  activityForm.startDate = ""
  activityForm.startTime = "00:00"
  activityForm.endDate = ""
  activityForm.endTime = "00:00"
  activityForm.images.splice(0)
}

function toDateTimeInputValue(value?: string) {
  if (!value) return ""
  const normalized = value.replace(" ", "T")
  return normalized.slice(0, 16)
}

function splitDateTimeParts(value?: string) {
  const normalized = toDateTimeInputValue(value)
  if (!normalized || !normalized.includes("T")) {
    return { date: "", time: "00:00" }
  }
  const [date, time] = normalized.split("T")
  return { date, time: (time || "00:00").slice(0, 5) }
}

function mergeDateAndTime(date: string, time: string) {
  if (!date) return ""
  const finalTime = time || "00:00"
  return `${date}T${finalTime}:00`
}

function setFormFromActivity(activity: ActivityResponseDto) {
  activityForm.title = activity.title ?? ""
  activityForm.description = activity.description ?? ""
  activityForm.affiliatePrice = activity.affiliatePrice ?? null
  activityForm.noAffiliatePrice = activity.noAffiliatePrice ?? null
  const start = splitDateTimeParts(activity.startDate)
  const end = splitDateTimeParts(activity.endDate)
  activityForm.startDate = start.date
  activityForm.startTime = start.time
  activityForm.endDate = end.date
  activityForm.endTime = end.time

  activityForm.images.splice(0)
  activity.imagesPath.forEach((imagePath, index) => {
    activityForm.images.push({
      clientId: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      image: `image-${index + 1}`,
      description: "",
      file: null,
      existing: true,
      sourcePath: imagePath
    })
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

async function handleSave() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const orderedImages = activityForm.images.filter((item) => item.existing || item.file)
    const imagesPayload = orderedImages.map((item, index) => ({
      image: `image-${index + 1}`,
      description: item.description
    }))

    const fileEntries = await Promise.all(
      orderedImages.map(async (item, index) => {
        const imageName = `image-${index + 1}`

        if (item.file) {
          return [imageName, item.file] as const
        }

        if (item.existing && item.sourcePath) {
          const response = await fetch(getImageUrl(item.sourcePath), { cache: "no-store" })
          if (!response.ok) {
            throw new Error(`No se pudo recuperar la imagen existente ${imageName}`)
          }

          const blob = await response.blob()
          const extension = getFileExtension(item.sourcePath)
          const file = new File([blob], `${imageName}${extension}`, {
            type: blob.type || "application/octet-stream"
          })

          return [imageName, file] as const
        }

        return null
      })
    )

    const filesPayload: Record<string, File> = {}
    fileEntries.forEach((entry) => {
      if (!entry) return
      filesPayload[entry[0]] = entry[1]
    })

    const request: CreateActivityRequestDto = {
      title: activityForm.title,
      description: activityForm.description || undefined,
      affiliatePrice: Number(activityForm.affiliatePrice ?? 0),
      noAffiliatePrice: activityForm.noAffiliatePrice == null ? undefined : Number(activityForm.noAffiliatePrice),
      startDate: mergeDateAndTime(activityForm.startDate, activityForm.startTime),
      endDate: activityForm.endDate ? mergeDateAndTime(activityForm.endDate, activityForm.endTime) : undefined,
      images: imagesPayload
    }

    if (isEditMode.value && props.activity) {
      await updateActivity(props.activity.slug, request, filesPayload)
    } else {
      await createActivity(request, filesPayload)
    }

    bumpImagesVersion()
    close()
    resetForm()
    emit("saved")
  } catch (error) {
    console.error("Error guardando actividad:", error)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (isEditMode.value && props.activity) {
        setFormFromActivity(props.activity)
      } else {
        resetForm()
        activityForm.images = [{
          clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          image: "image-1",
          description: "",
          file: null,
          existing: false,
          sourcePath: null
        }]
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
      <h2>{{ isEditMode ? "Editar actividad" : "Crear actividad" }}</h2>
    </div>

    <form class="admin-form activity-form" @submit.prevent="handleSave">
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label for="activity-title">Titulo</label>
          <input id="activity-title" v-model="activityForm.title" type="text" required />
        </div>
      </div>

      <div class="admin-form-group">
        <label for="activity-description">Descripcion</label>
        <textarea id="activity-description" v-model="activityForm.description" rows="5" />
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="activity-affiliate-price">Precio afiliados</label>
          <input
            id="activity-affiliate-price"
            v-model.number="activityForm.affiliatePrice"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div class="admin-form-group">
          <label for="activity-no-affiliate-price">Precio no afiliados</label>
          <input
            id="activity-no-affiliate-price"
            v-model.number="activityForm.noAffiliatePrice"
            type="number"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="activity-start-date">Fecha inicio</label>
          <input id="activity-start-date" v-model="activityForm.startDate" type="date" required />
        </div>

        <div class="admin-form-group">
          <label for="activity-start-time">Hora inicio</label>
          <input id="activity-start-time" v-model="activityForm.startTime" type="time" required />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="activity-end-date">Fecha fin</label>
          <input id="activity-end-date" v-model="activityForm.endDate" type="date" />
        </div>

        <div class="admin-form-group">
          <label for="activity-end-time">Hora fin</label>
          <input id="activity-end-time" v-model="activityForm.endTime" type="time" :disabled="!activityForm.endDate" />
        </div>
      </div>

      <ImageForm
        v-model="activityForm.images"
        title="Imagenes"
        add-label="+ Imagen"
        empty-hint="Anade imagenes para la actividad."
        id-prefix="activity-image-file"
      />

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
.activity-form {
  gap: 1rem;
}
</style>
