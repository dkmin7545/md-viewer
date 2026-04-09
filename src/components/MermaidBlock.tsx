import { useEffect, useId, useRef, useState } from 'react'

// mermaid는 ~600KB 무거우므로 mermaid 블록이 실제로 등장할 때만 import
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null
async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const m = mod.default
      m.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme:
          document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
        fontSize: 14,
      })
      return m
    })
  }
  return mermaidPromise
}

export function MermaidBlock({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSource, setShowSource] = useState(false)
  // 다이어그램마다 고유 id 필요 (mermaid.render 요구)
  const reactId = useId()
  const renderId = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    let cancelled = false
    setError(null)
    loadMermaid()
      .then(async (mermaid) => {
        if (cancelled || !ref.current) return
        try {
          const { svg } = await mermaid.render(renderId, value)
          if (!cancelled && ref.current) ref.current.innerHTML = svg
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e))
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [value, renderId])

  if (showSource || error) {
    return (
      <div
        style={{
          border: '1px solid var(--mdv-border)',
          borderRadius: 8,
          padding: 12,
          background: 'var(--mdv-surface)',
          margin: '12px 0',
        }}
      >
        {error && (
          <div style={{ color: 'crimson', fontSize: 13, marginBottom: 8 }}>
            mermaid 렌더 실패: {error}
          </div>
        )}
        <pre style={{ margin: 0, fontSize: 13, overflow: 'auto' }}>
          <code>{value}</code>
        </pre>
        {!error && (
          <button
            onClick={() => setShowSource(false)}
            style={{
              marginTop: 8,
              padding: '4px 10px',
              fontSize: 12,
              border: '1px solid var(--mdv-border)',
              borderRadius: 6,
              background: 'var(--mdv-bg)',
              color: 'var(--mdv-fg)',
              cursor: 'pointer',
            }}
          >
            다이어그램 보기
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        margin: '12px 0',
        padding: 12,
        background: '#fff',
        borderRadius: 8,
        overflow: 'auto',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div ref={ref} />
      <button
        onClick={() => setShowSource(true)}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          padding: '2px 8px',
          fontSize: 11,
          border: '1px solid #ddd',
          borderRadius: 4,
          background: '#f7f7f7',
          color: '#555',
          cursor: 'pointer',
        }}
      >
        소스
      </button>
    </div>
  )
}
