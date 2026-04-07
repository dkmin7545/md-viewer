import { useViewerStore, FONT_RANGE } from '../store/viewerStore'

// spec §2-3: 화면 하단 상시 노출 — 핵심 가치 제안
export function FontSizeBar() {
  const fontSize = useViewerStore((s) => s.fontSize)
  const setFontSize = useViewerStore((s) => s.setFontSize)

  const presets: { label: string; value: number }[] = [
    { label: '보통', value: 18 },
    { label: '크게', value: 22 },
    { label: '매우크게', value: 26 },
  ]

  const presetBtn = (active: boolean): React.CSSProperties => ({
    minHeight: 44,
    minWidth: 44,
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid var(--mdv-border)',
    background: active ? 'var(--mdv-accent)' : 'var(--mdv-surface)',
    color: active ? '#fff' : 'var(--mdv-fg)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  })

  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--mdv-border)',
        background: 'var(--mdv-bg)',
        position: 'sticky',
        bottom: 0,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        {presets.map((p) => (
          <button
            key={p.value}
            style={presetBtn(fontSize === p.value)}
            onClick={() => setFontSize(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min={FONT_RANGE.min}
        max={FONT_RANGE.max}
        step={FONT_RANGE.step}
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        style={{ flex: 1, minHeight: 44, accentColor: 'var(--mdv-accent)' }}
        aria-label="글자 크기"
      />
      <div
        style={{
          minWidth: 48,
          textAlign: 'right',
          fontSize: 14,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--mdv-fg)',
        }}
      >
        {fontSize}px
      </div>
    </footer>
  )
}
