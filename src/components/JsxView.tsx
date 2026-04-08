import { useEffect, useRef, useState } from 'react'
import type { LoadedFile } from '../store/viewerStore'

type Props = { file: LoadedFile }

// public/jsx-renderer/index.html을 sandbox iframe으로 띄우고, 활성 파일 코드를
// postMessage로 넘긴다. iframe은 활성 파일이 바뀌어도 재생성하지 않고 메시지만 다시 보낸다.
export function JsxView({ file }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [showSource, setShowSource] = useState(false)

  // iframe → parent로 'jsx-renderer-ready' 메시지 받으면 코드 송신 시작
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== location.origin) return
      if (e.data?.type === 'jsx-renderer-ready') setReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // ready 상태가 되거나 활성 파일이 바뀌면 코드 송신
  useEffect(() => {
    if (!ready) return
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      { type: 'render-jsx', name: file.name, code: file.content },
      location.origin,
    )
  }, [ready, file.id, file.content, file.name])

  const src = `${import.meta.env.BASE_URL}jsx-renderer/index.html?embed=1`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          ref={iframeRef}
          title={file.name}
          src={src}
          // same-origin 정적 자산이므로 sandbox 없이 사용 (동일 origin = jsx-renderer가
          // 메인 앱과 같은 신뢰 영역). Babel/CDN 동적 script 로드를 위해 sandbox 미적용.
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
