import { useCallback } from 'react'
import { useViewerStore, detectKind, type LoadedFile } from '../store/viewerStore'

async function readFiles(fileList: FileList | File[]): Promise<LoadedFile[]> {
  const arr = Array.from(fileList)
    .map((f) => ({ file: f, kind: detectKind(f.name) }))
    .filter((x): x is { file: File; kind: NonNullable<typeof x.kind> } => x.kind !== null)
  return Promise.all(
    arr.map(async ({ file, kind }) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      content: await file.text(),
      kind,
    })),
  )
}

// P0: 로컬 업로드 + 폴더 + 드래그앤드롭. localStorage 영속화는 P1.
export function useFiles() {
  const addFiles = useViewerStore((s) => s.addFiles)

  const loadFromInput = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return
      const loaded = await readFiles(fileList)
      if (loaded.length) addFiles(loaded)
    },
    [addFiles],
  )

  const loadFromDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const items = e.dataTransfer?.files
      if (items) {
        const loaded = await readFiles(items)
        if (loaded.length) addFiles(loaded)
      }
    },
    [addFiles],
  )

  return { loadFromInput, loadFromDrop }
}
