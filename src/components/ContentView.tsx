import { useState } from 'react'
import { useViewerStore } from '../store/viewerStore'
import { MarkdownView } from './MarkdownView'
import { HtmlView } from './HtmlView'
import { JsxView } from './JsxView'
import { JoinPrompt } from './JoinPrompt'

export function ContentView() {
  const file = useViewerStore((s) => s.files.find((f) => f.id === s.activeId) ?? null)
  const [joinOpen, setJoinOpen] = useState(false)

  if (!file) {
    return (
      <div className="markdown-body" style={{ color: 'var(--mdv-muted)' }}>
        <p>왼쪽 위 버튼으로 파일(.md / .html / .jsx)을 열거나, 이 영역에 드래그하세요.</p>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => setJoinOpen(true)}
            style={{
              minHeight: 56,
              padding: '0 24px',
              border: '1px solid var(--mdv-border)',
              borderRadius: 12,
              background: 'var(--mdv-surface)',
              color: 'var(--mdv-fg)',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📥 코드로 받기
          </button>
        </div>
        {joinOpen && <JoinPrompt onClose={() => setJoinOpen(false)} />}
      </div>
    )
  }

  if (file.kind === 'html') return <HtmlView file={file} />
  if (file.kind === 'jsx') return <JsxView file={file} />
  return <MarkdownView />
}
