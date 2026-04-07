import { useCallback } from 'react'
import { useViewerStore, type LoadedFile } from '../store/viewerStore'

const isMarkdown = (f: File) =>
  f.name.toLowerCase().endsWith('.md') || f.name.toLowerCase().endsWith('.markdown')

async function readFiles(fileList: FileList | File[]): Promise<LoadedFile[]> {
  const arr = Array.from(fileList).filter(isMarkdown)
  return Promise.all(
    arr.map(async (f) => ({
      id: `${f.name}-${f.lastModified}-${f.size}`,
      name: f.name,
      content: await f.text(),
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
