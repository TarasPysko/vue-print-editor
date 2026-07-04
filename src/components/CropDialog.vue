<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import { roundRect } from '@/utils/imagePipeline'

const store = useEditorStore()
const { cropDialogOpen, originalUrl, operations } = storeToRefs(store)

const imageRef = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null

function destroyCropper() {
  cropper?.destroy()
  cropper = null
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to load image'))
  })
}

async function initCropper() {
  await nextTick()
  const image = imageRef.value
  if (!image || !originalUrl.value) return

  await waitForImage(image)
  destroyCropper()

  cropper = new Cropper(image, {
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    responsive: true,
    background: false,
  })

  const existing = operations.value?.crop
  if (existing) {
    cropper.setData(existing)
  }
}

function applyCrop() {
  if (!cropper) return
  const data = cropper.getData(true)
  store.setCrop(roundRect({
    x: data.x ?? 0,
    y: data.y ?? 0,
    width: data.width ?? 0,
    height: data.height ?? 0,
  }))
  store.cropDialogOpen = false
}

watch(cropDialogOpen, async (open) => {
  if (open) await initCropper()
  else destroyCropper()
})

onBeforeUnmount(destroyCropper)
</script>

<template>
  <v-dialog v-model="store.cropDialogOpen" max-width="920" scrollable>
    <v-card class="crop-dialog">
      <v-card-title class="crop-dialog__title">
        <v-icon start>mdi-crop</v-icon>
        Crop image
      </v-card-title>

      <v-card-text class="pa-4">
        <div class="cropper-container">
          <img ref="imageRef" :src="originalUrl ?? undefined" alt="Crop" />
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn variant="text" color="error" @click="store.setCrop(null); store.cropDialogOpen = false">
          Clear crop
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="store.cropDialogOpen = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="applyCrop">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crop-dialog__title {
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #eceff1;
}
</style>
