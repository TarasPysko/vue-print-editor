import type { AdjustValues, CropRect, FilterName, OperationsDocument } from '@/types/editor'

let canvasFilterSupported: boolean | null = null

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/** Safari exposes ctx.filter but often ignores it — verify with a real draw. */
export function isCanvasFilterSupported(): boolean {
  if (canvasFilterSupported !== null) return canvasFilterSupported

  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx || !('filter' in ctx)) {
      canvasFilterSupported = false
      return false
    }

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 1, 1)
    ctx.filter = 'brightness(0%)'
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 1, 1)

    const [r] = ctx.getImageData(0, 0, 1, 1).data
    canvasFilterSupported = r === 0
  } catch {
    canvasFilterSupported = false
  }

  return canvasFilterSupported
}

function applyFiltersToImageData(
  imageData: ImageData,
  adjust: AdjustValues,
  filter: FilterName,
): void {
  const { data } = imageData
  const brightness = adjust.brightness / 100
  const contrast = adjust.contrast / 100
  const saturation = adjust.saturation / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    r = clampChannel(r * brightness)
    g = clampChannel(g * brightness)
    b = clampChannel(b * brightness)

    r = clampChannel(((r / 255 - 0.5) * contrast + 0.5) * 255)
    g = clampChannel(((g / 255 - 0.5) * contrast + 0.5) * 255)
    b = clampChannel(((b / 255 - 0.5) * contrast + 0.5) * 255)

    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r = clampChannel(gray + (r - gray) * saturation)
    g = clampChannel(gray + (g - gray) * saturation)
    b = clampChannel(gray + (b - gray) * saturation)

    if (filter === 'greyscale') {
      const value = clampChannel(0.2126 * r + 0.7152 * g + 0.0722 * b)
      r = g = b = value
    } else if (filter === 'sepia') {
      r = clampChannel(0.393 * r + 0.769 * g + 0.189 * b)
      g = clampChannel(0.349 * r + 0.686 * g + 0.168 * b)
      b = clampChannel(0.272 * r + 0.534 * g + 0.131 * b)
    }

    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
}

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
  const useNativeFilter = isCanvasFilterSupported()
  const ctx = canvas.getContext('2d', useNativeFilter ? undefined : { willReadFrequently: true })
  if (!ctx) return

  canvas.width = crop.width
  canvas.height = crop.height

  if (useNativeFilter) {
    ctx.filter = buildCanvasFilter(operations.adjust, operations.filter)
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
    ctx.filter = 'none'
    return
  }

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  const imageData = ctx.getImageData(0, 0, crop.width, crop.height)
  applyFiltersToImageData(imageData, operations.adjust, operations.filter)
  ctx.putImageData(imageData, 0, 0)
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
