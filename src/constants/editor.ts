import type { AdjustKey, FilterName } from '@/types/editor'

export const ADJUST_CONTROLS: {
  key: AdjustKey
  label: string
  icon: string
}[] = [
  { key: 'brightness', label: 'Brightness', icon: 'mdi-brightness-6' },
  { key: 'contrast', label: 'Contrast', icon: 'mdi-contrast-circle' },
  { key: 'saturation', label: 'Saturation', icon: 'mdi-palette' },
]

export const FILTERS: { label: string; value: FilterName; icon: string }[] = [
  { label: 'Original', value: 'none', icon: 'mdi-image' },
  { label: 'Greyscale', value: 'greyscale', icon: 'mdi-invert-colors-off' },
  { label: 'Sepia', value: 'sepia', icon: 'mdi-image-filter-vintage' },
]
