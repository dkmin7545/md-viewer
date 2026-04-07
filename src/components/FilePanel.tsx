import { useMemo, useState } from 'react'
import { useViewerStore } from '../store/viewerStore'

// spec §2-4: 왼쪽 스와이프 사이드 패널 — 파일 목록 + 검색 + 탭 전환
export function FilePanel() {
  const open = useViewerStore((s) => s.filePanelOpen)
  const setOpen = useViewerStore((s) => s.setFilePanelOpen)
  const files = useViewerStore((s) => s.files)
  const activeId = useViewerStore((s) => s.activeId)
  const setActive = useViewerStore((s) => s.setActive)
  const closeFile = useViewerStore((s) => s.closeFile)
  const recent = useViewerStore((s) => s.recent)

  const [q, setQ] = useState('')
  const filtered = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())),
    [files, q],
  )

  return (
    <>
      {/* 백드롭 */}
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
          left: 0,
          bottom: 0,
          width: 'min(86vw, 320px)',
          background: 'var(--mdv-surface)',
          borderRight: '1px solid var(--mdv-border)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
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
            padding: '12px',
            borderBottom: '1px solid var(--mdv-border)',
          }}
        >
          <strong style={{ flex: 1, fontSize: 16 }}>파일</strong>
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
        <div style={{ padding: '10px 12px' }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="파일명 검색"
            style={{
              width: '100%',
              minHeight: 44,
              padding: '0 12px',
              border: '1px solid var(--mdv-border)',
              borderRadius: 8,
              background: 'var(--mdv-bg)',
              color: 'var(--mdv-fg)',
              fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 12, color: 'var(--mdv-muted)', fontSize: 14 }}>
              열린 파일이 없습니다.
            </div>
          )}
          {filtered.map((f) => {
            const isActive = f.id === activeId
            return (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  borderRadius: 8,
                  background: isActive ? 'var(--mdv-accent-soft)' : 'transparent',
                  marginBottom: 2,
                }}
              >
                <button
                  onClick={() => setActive(f.id)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    padding: '0 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    color: 'var(--mdv-fg)',
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {f.name}
                </button>
                <button
                  onClick={() => closeFile(f.id)}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--mdv-muted)',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                  aria-label={`${f.name} 닫기`}
                >
                  ✕
                </button>
              </div>
            )
          })}

          {recent.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--mdv-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                최근 열람
              </div>
              {recent.map((r) => (
                <div
                  key={r.name}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    color: 'var(--mdv-muted)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {r.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
