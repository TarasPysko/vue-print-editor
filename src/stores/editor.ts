import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { AdjustKey, CropRect, FilterName, ImageSourceMeta, OperationsDocument } from '@/types/editor'
import { createDefaultOperations, hasEdits } from '@/types/editor'
import { canvasToBlob, downloadBlob, loadImageFromUrl, renderImage } from '@/utils/imagePipeline'

export const useEditorStore = defineStore('editor', () => {
  const originalUrl = ref<string | null>(null)
  const originalImage = shallowRef<HTMLImageElement | null>(null)
  const sourceMeta = ref<ImageSourceMeta | null>(null)
  const operations = ref<OperationsDocument | null>(null)
  const showOriginal = ref(false)
  const cropDialogOpen = ref(false)

  const hasImage = computed(() => originalImage.value !== null)
  const isEdited = computed(() => (operations.value ? hasEdits(operations.value) : false))
  const operationsJson = computed(() =>
    operations.value ? JSON.stringify(operations.value, null, 2) : '{}',
  )

  async function loadImage(file: File) {
    if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)

    const url = URL.createObjectURL(file)
    const image = await loadImageFromUrl(url)

    originalUrl.value = url
    originalImage.value = image
    showOriginal.value = false
    sourceMeta.value = {
      fileName: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }
    operations.value = createDefaultOperations(sourceMeta.value)
  }

  function setCrop(crop: CropRect | null) {
    if (!operations.value) return
    operations.value.crop = crop
  }

  function setAdjust(key: AdjustKey, value: number) {
    if (!operations.value) return
    operations.value.adjust[key] = value
  }

  function setFilter(filter: FilterName) {
    if (!operations.value) return
    operations.value.filter = filter
  }

  function resetEdits() {
    if (!sourceMeta.value) return
    operations.value = createDefaultOperations(sourceMeta.value)
    showOriginal.value = false
  }

  function toggleShowOriginal() {
    showOriginal.value = !showOriginal.value
  }

  async function exportResult(includeJson: boolean) {
    if (!originalImage.value || !operations.value || !sourceMeta.value) return

    const canvas = document.createElement('canvas')
    renderImage(originalImage.value, operations.value, canvas)
    const blob = await canvasToBlob(canvas)
    const baseName = sourceMeta.value.fileName.replace(/\.[^.]+$/, '') || 'edited-image'

    downloadBlob(blob, `${baseName}-edited.png`)

    if (includeJson) {
      downloadBlob(
        new Blob([operationsJson.value], { type: 'application/json' }),
        `${baseName}-operations.json`,
      )
    }
  }

  return {
    originalUrl,
    originalImage,
    sourceMeta,
    operations,
    showOriginal,
    cropDialogOpen,
    hasImage,
    isEdited,
    operationsJson,
    loadImage,
    setCrop,
    setAdjust,
    setFilter,
    resetEdits,
    toggleShowOriginal,
    exportResult,
  }
})
