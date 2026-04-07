import { useMemo } from 'react'
import { useViewerStore } from '../store/viewerStore'
import { extractHeadings } from '../lib/headings'

// spec §2-4: 우측 스와이프 목차 패널 — H1–H3 자동 생성
export function TocPanel() {
  const open = useViewerStore((s) => s.tocPanelOpen)
  const setOpen = useViewerStore((s) => s.setTocPanelOpen)
  const file = useViewerStore((s) => s.files.find((f) => f.id === s.activeId) ?? null)

  const headings = useMemo(() => (file ? extractHeadings(file.content) : []), [file])

  const jump = (id: string, level: number) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // spec §2-5: H1–H2만 URL 해시 업데이트
      if (level <= 2) history.replaceState(null, '', `#${id}`)
    }
    setOpen(false)
  }

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 180ms',
          zIndex: 20,
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(86vw, 320px)',
          background: 'var(--mdv-surface)',
          borderLeft: '1px solid var(--mdv-border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 220ms ease',
          zIndex: 21,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'env(safe-area-inset-top)',
        }}
        aria-hidden={!open}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderBottom: '1px solid var(--mdv-border)',
          }}
        >
          <strong style={{ flex: 1, fontSize: 16 }}>목차</strong>
          <button
            onClick={() => setOpen(false)}
            style={{
              minHeight: 44,
              minWidth: 44,
              border: '1px solid var(--mdv-border)',
              borderRadius: 8,
              background: 'var(--mdv-bg)',
              color: 'var(--mdv-fg)',
              cursor: 'pointer',
            }}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px 12px' }}>
          {headings.length === 0 && (
            <div style={{ padding: 12, color: 'var(--mdv-muted)', fontSize: 14 }}>
              헤딩이 없습니다.
            </div>
          )}
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => jump(h.id, h.level)}
              style={{
                display: 'block',
                width: '100%',
                minHeight: 44,
                padding: `0 12px 0 ${12 + (h.level - 1) * 16}px`,
                border: 'none',
                background: 'transparent',
                color: 'var(--mdv-fg)',
                textAlign: 'left',
                fontSize: h.level === 1 ? 15 : 14,
                fontWeight: h.level === 1 ? 600 : 400,
                cursor: 'pointer',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
