import { onScopeDispose, watch, type Ref } from 'vue'
import type { OperationsDocument } from '@/types/editor'
import { renderImage } from '@/utils/imagePipeline'

export function usePreviewCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  image: Ref<HTMLImageElement | null>,
  operations: Ref<OperationsDocument | null>,
  showOriginal: Ref<boolean>,
) {
  let frame = 0

  function paint() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const canvas = canvasRef.value
      const source = image.value
      const ops = operations.value

      if (!canvas || !source || !ops || showOriginal.value) return
      renderImage(source, ops, canvas)
    })
  }

  watch([image, operations, showOriginal], paint, { deep: true, immediate: true })

  onScopeDispose(() => cancelAnimationFrame(frame))
}
