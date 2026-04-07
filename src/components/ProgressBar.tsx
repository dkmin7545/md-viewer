import { useEffect, useState, type RefObject } from 'react'

// spec §2-5: 상단 얇은 스크롤 진행 바
export function ProgressBar({ scrollRef }: { scrollRef: RefObject<HTMLElement> }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setPct(max <= 0 ? 0 : Math.min(1, el.scrollTop / max))
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(onScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [scrollRef])

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: 3,
        zIndex: 11,
        background: 'transparent',
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          background: 'var(--mdv-accent)',
          transition: 'width 80ms linear',
        }}
      />
    </div>
  )
}
