<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const dragging = ref(false)
const error = ref<string | null>(null)

async function processFile(file: File | undefined) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = 'Please select a valid image file.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await store.loadImage(file)
  } catch {
    error.value = 'Could not load this image. Try a different file.'
  } finally {
    loading.value = false
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  processFile(input.files?.[0])
  input.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false
  processFile(event.dataTransfer?.files?.[0])
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  dragging.value = true
}

function onDragLeave() {
  dragging.value = false
}

function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="upload-shell">
    <div
      class="upload-zone"
      :class="{ 'upload-zone--active': dragging, 'upload-zone--loading': loading }"
      @click="openPicker"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        hidden
        @change="onFileSelected"
      />

      <div class="upload-zone__icon">
        <v-icon size="40" color="primary">mdi-tray-arrow-up</v-icon>
      </div>

      <h1 class="upload-zone__title">Drop your image here</h1>
      <p class="upload-zone__hint">or click to browse — JPG, PNG, WebP supported</p>

      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="mt-6"
        prepend-icon="mdi-folder-open"
        :loading="loading"
        @click.stop="openPicker"
      >
        Choose file
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<style scoped>
.upload-shell {
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 0;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 32px;
  border: 2px dashed #b0bec5;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.upload-zone:hover,
.upload-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background: #f8f9ff;
  box-shadow: 0 4px 24px rgba(26, 35, 126, 0.08);
}

.upload-zone--loading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-zone__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: rgba(26, 35, 126, 0.06);
}

.upload-zone__title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 500;
  color: #263238;
}

.upload-zone__hint {
  margin: 0;
  font-size: 0.875rem;
  color: #78909c;
}
</style>
