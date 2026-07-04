<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import ImageUpload from '@/components/ImageUpload.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import EditorPanel from '@/components/EditorPanel.vue'
import CropDialog from '@/components/CropDialog.vue'

const { hasImage } = storeToRefs(useEditorStore())
</script>

<template>
  <v-app>
    <v-app-bar flat color="primary" height="64">
      <v-app-bar-title class="app-bar__title">
        <v-icon size="22" class="mr-2">mdi-printer-settings</v-icon>
        Print Image Editor
      </v-app-bar-title>
      <v-spacer />
      <v-chip
        v-if="hasImage"
        size="small"
        variant="outlined"
        color="white"
        prepend-icon="mdi-shield-check-outline"
      >
        Non-destructive
      </v-chip>
    </v-app-bar>

    <v-main class="app-main">
      <v-container class="app-container" fluid>
        <ImageUpload v-if="!hasImage" />

        <v-row v-else class="editor-layout" align="start">
          <v-col cols="12" lg="8" xl="9">
            <ImagePreview />
          </v-col>
          <v-col cols="12" lg="4" xl="3">
            <EditorPanel />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <CropDialog />
  </v-app>
</template>

<style scoped>
.app-bar__title {
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.app-main {
  background: #f4f6f8;
}

.app-container {
  max-width: 1400px;
  padding-top: 24px;
  padding-bottom: 32px;
}

.editor-layout {
  gap: 20px;
}
</style>
