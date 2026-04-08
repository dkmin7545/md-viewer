import { useEffect, useRef, useState } from 'react'
import { TopBar } from './components/TopBar'
import { ContentView } from './components/ContentView'
import { FontSizeBar } from './components/FontSizeBar'
import { FilePanel } from './components/FilePanel'
import { TocPanel } from './components/TocPanel'
import { ProgressBar } from './components/ProgressBar'
import { JoinPrompt } from './components/JoinPrompt'
import { useFiles } from './hooks/useFiles'
import { useViewerStore } from './store/viewerStore'

export default function App() {
  const { loadFromDrop } = useFiles()
  const fontSize = useViewerStore((s) => s.fontSize)
  const theme = useViewerStore((s) => s.theme)
  const activeId = useViewerStore((s) => s.activeId)
  const immersive = useViewerStore((s) => s.immersive)
  const toggleImmersive = useViewerStore((s) => s.toggleImmersive)
  const hydrateSession = useViewerStore((s) => s.hydrateSession)
  const mainRef = useRef<HTMLElement>(null)
  const [joinCode, setJoinCode] = useState<string | null>(null)

  useEffect(() => {
    void hydrateSession()
    const params = new URLSearchParams(location.search)
    const code = params.get('join')
    if (code) {
      setJoinCode(code)
      params.delete('join')
      const qs = params.toString()
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''))
    }
  }, [hydrateSession])

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
      <main
        ref={mainRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ProgressBar scrollRef={mainRef} />
        <ContentView />
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
      {joinCode !== null && (
        <JoinPrompt initialCode={joinCode} onClose={() => setJoinCode(null)} />
      )}
    </div>
  )
}
