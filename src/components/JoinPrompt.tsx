import { useState } from 'react'
import { useViewerStore } from '../store/viewerStore'
import { joinAsReceiver } from '../lib/peerSync'

type Props = { initialCode?: string; onClose: () => void }

export function JoinPrompt({ initialCode = '', onClose }: Props) {
  const addFiles = useViewerStore((s) => s.addFiles)
  const [code, setCode] = useState(initialCode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const files = await joinAsReceiver(code)
      addFiles(
        files.map((f) => ({
          id: f.id || `${f.name}-${Date.now()}`,
          name: f.name,
          content: f.content,
          kind: f.kind,
        })),
      )
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--mdv-surface)',
          color: 'var(--mdv-fg)',
          border: '1px solid var(--mdv-border)',
          borderRadius: 12,
          padding: 20,
          maxWidth: 360,
          width: '100%',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 18, textAlign: 'center' }}>
          코드로 받기
        </h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6자리 코드"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={6}
          style={{
            width: '100%',
            minHeight: 48,
            padding: '0 12px',
            border: '1px solid var(--mdv-border)',
            borderRadius: 8,
            background: 'var(--mdv-bg)',
            color: 'var(--mdv-fg)',
            fontSize: 22,
            letterSpacing: 4,
            fontFamily: 'monospace',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ color: 'crimson', fontSize: 13, marginTop: 8 }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: 44,
              border: '1px solid var(--mdv-border)',
              borderRadius: 8,
              background: 'var(--mdv-bg)',
              color: 'var(--mdv-fg)',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={busy || code.length !== 6}
            style={{
              flex: 1,
              minHeight: 44,
              border: '1px solid var(--mdv-border)',
              borderRadius: 8,
              background: 'var(--mdv-fg)',
              color: 'var(--mdv-bg)',
              fontSize: 15,
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy || code.length !== 6 ? 0.5 : 1,
            }}
          >
            {busy ? '받는 중…' : '받기'}
          </button>
        </div>
      </div>
    </div>
  )
}
