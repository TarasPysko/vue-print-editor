import type { AdjustValues, CropRect, FilterName, OperationsDocument } from '@/types/editor'

export function buildCanvasFilter(adjust: AdjustValues, filter: FilterName): string {
  const parts = [
    `brightness(${adjust.brightness}%)`,
    `contrast(${adjust.contrast}%)`,
    `saturate(${adjust.saturation}%)`,
  ]

  if (filter === 'greyscale') parts.push('grayscale(100%)')
  if (filter === 'sepia') parts.push('sepia(100%)')

  return parts.join(' ')
}

export function getCropRect(image: HTMLImageElement, crop: CropRect | null): CropRect {
  return crop ?? {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  }
}

export function renderImage(
  image: HTMLImageElement,
  operations: OperationsDocument,
  canvas: HTMLCanvasElement,
): void {
  const crop = getCropRect(image, operations.crop)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = crop.width
  canvas.height = crop.height
  ctx.filter = buildCanvasFilter(operations.adjust, operations.filter)
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to export image'))),
      type,
    )
  })
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = url
  })
}

export function roundRect(rect: CropRect): CropRect {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}
