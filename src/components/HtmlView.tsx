import { useState } from 'react'
import type { LoadedFile } from '../store/viewerStore'

type Props = { file: LoadedFile }

export function HtmlView({ file }: Props) {
  const [showSource, setShowSource] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '6px 12px',
          borderBottom: '1px solid var(--mdv-border)',
          background: 'var(--mdv-surface)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setShowSource((v) => !v)}
          style={{
            minHeight: 36,
            padding: '0 12px',
            border: '1px solid var(--mdv-border)',
            borderRadius: 6,
            background: 'var(--mdv-bg)',
            color: 'var(--mdv-fg)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {showSource ? '렌더 보기' : '원본 보기'}
        </button>
      </div>
      {showSource ? (
        <pre
          style={{
            flex: 1,
            margin: 0,
            padding: 16,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: "'SF Mono', Monaco, Consolas, monospace",
            background: 'var(--mdv-bg)',
            color: 'var(--mdv-fg)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {file.content}
        </pre>
      ) : (
        <iframe
          // 키로 file.id를 줘서 활성 파일 변경 시 iframe 재생성
          key={file.id}
          title={file.name}
          srcDoc={file.content}
          // allow-same-origin 없음 → 부모 앱의 스토리지/쿠키 접근 차단
          sandbox="allow-scripts"
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            background: '#fff',
          }}
        />
      )}
    </div>
  )
}
