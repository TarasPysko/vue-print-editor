export const OPERATIONS_VERSION = 1 as const

export interface ImageSourceMeta {
  fileName: string
  width: number
  height: number
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface AdjustValues {
  brightness: number
  contrast: number
  saturation: number
}

export type FilterName = 'none' | 'greyscale' | 'sepia'
export type AdjustKey = keyof AdjustValues

export interface OperationsDocument {
  version: typeof OPERATIONS_VERSION
  source: ImageSourceMeta
  crop: CropRect | null
  adjust: AdjustValues
  filter: FilterName
}

export const DEFAULT_ADJUST: AdjustValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}

export function createDefaultOperations(source: ImageSourceMeta): OperationsDocument {
  return {
    version: OPERATIONS_VERSION,
    source,
    crop: null,
    adjust: { ...DEFAULT_ADJUST },
    filter: 'none',
  }
}

export function hasEdits(doc: OperationsDocument): boolean {
  return (
    doc.crop !== null ||
    doc.adjust.brightness !== DEFAULT_ADJUST.brightness ||
    doc.adjust.contrast !== DEFAULT_ADJUST.contrast ||
    doc.adjust.saturation !== DEFAULT_ADJUST.saturation ||
    doc.filter !== 'none'
  )
}
