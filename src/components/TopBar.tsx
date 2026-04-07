import { useRef } from 'react'
import { useFiles } from '../hooks/useFiles'
import { useViewerStore } from '../store/viewerStore'

export function TopBar() {
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const { loadFromInput } = useFiles()
  const activeName = useViewerStore(
    (s) => s.files.find((f) => f.id === s.activeId)?.name ?? 'MD Viewer',
  )
  const theme = useViewerStore((s) => s.theme)
  const toggleTheme = useViewerStore((s) => s.toggleTheme)
  const setFilePanelOpen = useViewerStore((s) => s.setFilePanelOpen)
  const setTocPanelOpen = useViewerStore((s) => s.setTocPanelOpen)
  const toggleImmersive = useViewerStore((s) => s.toggleImmersive)

  const btn: React.CSSProperties = {
    minHeight: 44,
    minWidth: 44,
    padding: '0 12px',
    border: '1px solid var(--mdv-border)',
    borderRadius: 8,
    background: 'var(--mdv-surface)',
    color: 'var(--mdv-fg)',
    fontSize: 15,
    cursor: 'pointer',
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px calc(8px)',
        paddingTop: 'calc(8px + env(safe-area-inset-top))',
        borderBottom: '1px solid var(--mdv-border)',
        background: 'var(--mdv-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <button style={btn} onClick={() => setFilePanelOpen(true)} aria-label="파일 목록">
        ☰
      </button>
      <button style={btn} onClick={() => fileRef.current?.click()}>파일</button>
      <button style={btn} onClick={() => folderRef.current?.click()}>폴더</button>
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--mdv-fg)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {activeName}
      </div>
      <button style={btn} onClick={toggleTheme} aria-label="테마 전환">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button style={btn} onClick={() => setTocPanelOpen(true)} aria-label="목차">
        ⋮≡
      </button>
      <button style={btn} onClick={toggleImmersive} aria-label="전체화면">
        ⛶
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        multiple
        hidden
        onChange={(e) => loadFromInput(e.target.files)}
      />
      <input
        ref={folderRef}
        type="file"
        hidden
        // @ts-expect-error non-standard attrs for folder picking
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => loadFromInput(e.target.files)}
      />
    </header>
  )
}
