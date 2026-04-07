import { useRef, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import { useViewerStore } from '../store/viewerStore'
import { SendModal } from './SendModal'
import { JoinPrompt } from './JoinPrompt'

export function TopBar() {
  const [sendOpen, setSendOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const filesCount = useViewerStore((s) => s.files.length)
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
    padding: '0 8px',
    border: '1px solid var(--mdv-border)',
    borderRadius: 8,
    background: 'var(--mdv-surface)',
    color: 'var(--mdv-fg)',
    fontSize: 15,
    cursor: 'pointer',
    flexShrink: 0,
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 8px calc(8px)',
        paddingTop: 'calc(8px + env(safe-area-inset-top))',
        flexWrap: 'nowrap',
        overflowX: 'auto',
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
      <button
        style={{ ...btn, opacity: filesCount === 0 ? 0.4 : 1 }}
        disabled={filesCount === 0}
        onClick={() => setSendOpen(true)}
        aria-label="모바일로 보내기"
        title="모바일로 보내기"
      >
        📤
      </button>
      <button
        style={btn}
        onClick={() => setJoinOpen(true)}
        aria-label="코드로 받기"
        title="코드로 받기"
      >
        📥
      </button>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'center',
          color: 'var(--mdv-fg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.1,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {activeName}
        </div>
        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>
          v{__APP_VERSION__} · {__BUILD_DATE__}
        </div>
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
        // iOS Safari는 text/markdown을 모르고 사진 피커로 폴백하므로 accept를 비워
        // 시스템 "파일" 피커가 뜨도록 한다. 비-md 파일은 useFiles에서 걸러진다.
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
      {sendOpen && <SendModal onClose={() => setSendOpen(false)} />}
      {joinOpen && <JoinPrompt onClose={() => setJoinOpen(false)} />}
    </header>
  )
}
