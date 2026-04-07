import { useEffect, useRef } from 'react'
import { TopBar } from './components/TopBar'
import { MarkdownView } from './components/MarkdownView'
import { FontSizeBar } from './components/FontSizeBar'
import { FilePanel } from './components/FilePanel'
import { TocPanel } from './components/TocPanel'
import { ProgressBar } from './components/ProgressBar'
import { useFiles } from './hooks/useFiles'
import { useViewerStore } from './store/viewerStore'

export default function App() {
  const { loadFromDrop } = useFiles()
  const fontSize = useViewerStore((s) => s.fontSize)
  const theme = useViewerStore((s) => s.theme)
  const activeId = useViewerStore((s) => s.activeId)
  const immersive = useViewerStore((s) => s.immersive)
  const toggleImmersive = useViewerStore((s) => s.toggleImmersive)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.style.setProperty('--md-font-size', `${fontSize}px`)
  }, [fontSize])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  }, [activeId])

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mdv-bg)',
        color: 'var(--mdv-fg)',
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={loadFromDrop}
    >
      {!immersive && <TopBar />}
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <ProgressBar scrollRef={mainRef} />
        <MarkdownView />
      </main>
      {!immersive && <FontSizeBar />}
      {immersive && (
        <button
          onClick={toggleImmersive}
          aria-label="전체화면 종료"
          style={{
            position: 'fixed',
            right: 12,
            bottom: 'calc(12px + env(safe-area-inset-bottom))',
            minHeight: 44,
            minWidth: 44,
            border: '1px solid var(--mdv-border)',
            borderRadius: 22,
            background: 'var(--mdv-surface)',
            color: 'var(--mdv-fg)',
            fontSize: 18,
            cursor: 'pointer',
            opacity: 0.85,
            zIndex: 15,
          }}
        >
          ⤢
        </button>
      )}
      <FilePanel />
      <TocPanel />
    </div>
  )
}
