import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useViewerStore } from '../store/viewerStore'
import { createSender, type SenderHandle, type SenderStatus } from '../lib/peerSync'

type Props = { onClose: () => void }

export function SendModal({ onClose }: Props) {
  const files = useViewerStore((s) => s.files)
  const [handle, setHandle] = useState<SenderHandle | null>(null)
  const [status, setStatus] = useState<SenderStatus>({ kind: 'waiting' })
  const [qrUrl, setQrUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let h: SenderHandle | null = null
    ;(async () => {
      try {
        h = await createSender(files)
        if (cancelled) {
          h.close()
          return
        }
        h.onStatus((s) => setStatus(s))
        setHandle(h)
        const joinUrl = `${location.origin}${location.pathname}?join=${h.code}`
        const dataUrl = await QRCode.toDataURL(joinUrl, { width: 240, margin: 1 })
        if (!cancelled) setQrUrl(dataUrl)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
      h?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const close = () => {
    handle?.close()
    onClose()
  }

  const statusLabel =
    status.kind === 'waiting'
      ? '모바일 연결 대기 중…'
      : status.kind === 'sending'
        ? '전송 중…'
        : status.kind === 'done'
          ? '전송 완료 ✓'
          : `오류: ${status.message}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
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
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>모바일로 보내기</h2>
        {error ? (
          <p style={{ color: 'crimson', fontSize: 14 }}>{error}</p>
        ) : (
          <>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="join QR"
                style={{ width: 240, height: 240, background: '#fff', borderRadius: 8 }}
              />
            ) : (
              <div
                style={{
                  width: 240,
                  height: 240,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: 'var(--mdv-muted, #888)',
                }}
              >
                준비 중…
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 4,
                fontFamily: 'monospace',
              }}
            >
              {handle?.code ?? '------'}
            </div>
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
              모바일 PWA에서 QR을 스캔하거나 코드를 입력하세요.
            </p>
            <p style={{ marginTop: 4, fontSize: 13 }}>{statusLabel}</p>
            <p style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>
              파일 {files.length}개 전송 준비됨
            </p>
          </>
        )}
        <button
          onClick={close}
          style={{
            marginTop: 16,
            minHeight: 44,
            padding: '0 20px',
            border: '1px solid var(--mdv-border)',
            borderRadius: 8,
            background: 'var(--mdv-bg)',
            color: 'var(--mdv-fg)',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
