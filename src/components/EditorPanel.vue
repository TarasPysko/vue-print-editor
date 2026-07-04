<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'
import { ADJUST_CONTROLS, FILTERS } from '@/constants/editor'
import type { FilterName } from '@/types/editor'

const store = useEditorStore()
const { operations, isEdited, showOriginal, sourceMeta } = storeToRefs(store)
const exporting = ref(false)
const includeJson = ref(true)

async function handleExport() {
  exporting.value = true
  try {
    await store.exportResult(includeJson.value)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <aside v-if="operations" class="editor-panel">
    <section class="editor-panel__block">
      <p class="panel-section-title">Adjust</p>

      <div v-for="control in ADJUST_CONTROLS" :key="control.key" class="slider-row">
        <div class="slider-row__head">
          <span class="slider-row__label">
            <v-icon size="16" class="mr-1">{{ control.icon }}</v-icon>
            {{ control.label }}
          </span>
          <span class="slider-row__value">{{ operations.adjust[control.key] }}%</span>
        </div>
        <v-slider
          :model-value="operations.adjust[control.key]"
          min="0"
          max="200"
          step="1"
          hide-details
          color="primary"
          @update:model-value="store.setAdjust(control.key, $event as number)"
        />
      </div>
    </section>

    <v-divider class="my-5" />

    <section class="editor-panel__block">
      <p class="panel-section-title">Filter</p>
      <v-btn-toggle
        :model-value="operations.filter"
        mandatory
        divided
        color="primary"
        density="comfortable"
        class="filter-toggle"
        @update:model-value="store.setFilter($event as FilterName)"
      >
        <v-btn
          v-for="item in FILTERS"
          :key="item.value"
          :value="item.value"
          size="small"
        >
          <v-icon start size="18">{{ item.icon }}</v-icon>
          {{ item.label }}
        </v-btn>
      </v-btn-toggle>
    </section>

    <v-divider class="my-5" />

    <section class="editor-panel__block">
      <p class="panel-section-title">Tools</p>
      <div class="tool-grid">
        <v-btn
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-crop"
          @click="store.cropDialogOpen = true"
        >
          Crop
        </v-btn>
        <v-btn
          variant="tonal"
          color="secondary"
          :prepend-icon="showOriginal ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          @click="store.toggleShowOriginal()"
        >
          {{ showOriginal ? 'Preview' : 'Original' }}
        </v-btn>
        <v-btn
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-backup-restore"
          :disabled="!isEdited"
          @click="store.resetEdits()"
        >
          Reset
        </v-btn>
      </div>
    </section>

    <v-divider class="my-5" />

    <section class="editor-panel__block">
      <p class="panel-section-title">Export</p>
      <v-checkbox
        v-model="includeJson"
        label="Include operations JSON"
        hide-details
        density="compact"
        color="primary"
        class="mb-3"
      />
      <v-btn
        color="primary"
        variant="flat"
        block
        size="large"
        prepend-icon="mdi-download"
        :loading="exporting"
        @click="handleExport"
      >
        Download PNG
      </v-btn>
    </section>

    <v-expansion-panels v-if="sourceMeta" variant="accordion" class="mt-5">
      <v-expansion-panel title="Operations JSON" elevation="0">
        <v-expansion-panel-text>
          <pre class="json-block">{{ store.operationsJson }}</pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </aside>
</template>

<style scoped>
.editor-panel {
  position: sticky;
  top: 88px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e4e8;
  border-radius: 12px;
}

.slider-row + .slider-row {
  margin-top: 16px;
}

.slider-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.slider-row__label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8125rem;
  color: #546e7a;
}

.slider-row__value {
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #37474f;
}

.filter-toggle {
  display: flex;
  width: 100%;
}

.filter-toggle :deep(.v-btn) {
  flex: 1;
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tool-grid .v-btn:last-child {
  grid-column: span 2;
}

.json-block {
  margin: 0;
  padding: 12px;
  background: #263238;
  color: #cfd8dc;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.5;
  overflow-x: auto;
}
</style>
