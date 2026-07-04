<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import { usePreviewCanvas } from '@/composables/usePreviewCanvas'

const store = useEditorStore()
const { originalImage, operations, showOriginal, originalUrl, sourceMeta, isEdited } = storeToRefs(store)
const canvasRef = ref<HTMLCanvasElement | null>(null)

usePreviewCanvas(canvasRef, originalImage, operations, showOriginal)
</script>

<template>
  <div class="preview-shell">
    <div class="preview-shell__header">
      <div>
        <p v-if="sourceMeta" class="preview-shell__filename">{{ sourceMeta.fileName }}</p>
        <p v-if="sourceMeta" class="preview-shell__meta">
          {{ sourceMeta.width }} × {{ sourceMeta.height }} px
        </p>
      </div>

      <div class="preview-shell__badges">
        <v-chip
          v-if="showOriginal"
          size="small"
          color="secondary"
          variant="flat"
          prepend-icon="mdi-eye-outline"
        >
          Original
        </v-chip>
        <v-chip
          v-else-if="isEdited"
          size="small"
          color="accent"
          variant="flat"
          prepend-icon="mdi-layers-outline"
        >
          Edited preview
        </v-chip>
      </div>
    </div>

    <div class="preview-shell__stage checkerboard">
      <canvas
        v-show="!showOriginal"
        ref="canvasRef"
        class="preview-canvas"
        draggable="false"
      />
      <img
        v-if="showOriginal && originalUrl"
        :src="originalUrl"
        alt="Original"
        class="preview-canvas"
        draggable="false"
        @dragstart.prevent
      />
    </div>
  </div>
</template>

<style scoped>
.preview-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.preview-shell__filename {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #37474f;
  word-break: break-all;
}

.preview-shell__meta {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #90a4ae;
}

.preview-shell__badges {
  flex-shrink: 0;
}

.preview-shell__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 24px;
  border-radius: 12px;
  overflow: hidden;
  touch-action: none;
}
</style>
