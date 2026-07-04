# Design notes

## Operation model

Edits are stored as a serializable **operations document**, not baked into pixels:

```json
{
  "version": 1,
  "source": { "fileName": "photo.jpg", "width": 1920, "height": 1080 },
  "crop": { "x": 120, "y": 80, "width": 800, "height": 600 },
  "adjust": { "brightness": 110, "contrast": 95, "saturation": 120 },
  "filter": "sepia"
}
```

- **source** — metadata about the untouched original (used to validate replay).
- **crop** — rectangle in original-image pixel coordinates; `null` means full frame.
- **adjust** — percentage values where `100` is neutral (maps to CSS/canvas filters).
- **filter** — optional post-adjust filter: `none`, `greyscale`, or `sepia`.

Replaying is deterministic: load the original image, then run the pipeline in order **crop → adjust → filter**. The same function drives both live preview and export.

## Non-destructive pipeline

The original file is kept as a blob URL and `HTMLImageElement` in Pinia. Preview and export always **derive** output from that source plus the operations document. Reset restores default operations; “View original” temporarily hides the derived preview.

Rendering uses a single canvas path (`src/utils/imagePipeline.ts`):

1. Pick source rectangle (crop or full image).
2. Set `ctx.filter` from adjust + filter values.
3. `drawImage` from the original into a fresh canvas.

This keeps preview and export consistent and avoids drift between CSS preview and canvas export.

## Trade-offs

| Choice | Why | Cost |
|--------|-----|------|
| Canvas for preview | Same code path as export | Re-renders on every slider tick (fine for typical print photos) |
| Cropper.js v1 | Stable Vue integration vs v2 web components | Older API, but task allows any cropper |
| Flat operations object vs op list | Easier to read/edit/replay for this scope | Less suited to undo history or arbitrary op ordering |
| Percent-based adjust | Matches CSS `brightness()` / `contrast()` / `saturate()` | Not the same as professional color grading tools |

## Bonus

- Filters: greyscale and sepia via canvas/CSS filter chain.
- Export downloads `{name}-edited.png` and optionally `{name}-operations.json` with the document above.

## Possible extensions

- Undo/redo stack of operations
- Import JSON to restore a session
- Web Worker for large images
- Rotation / flip as additional typed operations
