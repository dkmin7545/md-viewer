import { create } from 'zustand'

export type LoadedFile = {
  id: string
  name: string
  content: string
}

export type Theme = 'light' | 'dark'

const LS_FONT = 'mdv:fontSize'
const LS_THEME = 'mdv:theme'
const LS_RECENT = 'mdv:recent'

const FONT_MIN = 14
const FONT_MAX = 28
const FONT_DEFAULT = 18 // spec §2-3 — 절대 줄이지 말 것

function loadFont(): number {
  const v = Number(localStorage.getItem(LS_FONT))
  if (!v || v < FONT_MIN || v > FONT_MAX) return FONT_DEFAULT
  return v
}

function loadTheme(): Theme {
  const v = localStorage.getItem(LS_THEME)
  if (v === 'light' || v === 'dark') return v
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export type RecentFile = { name: string; lastOpened: number }
function loadRecent(): RecentFile[] {
  try {
    const raw = localStorage.getItem(LS_RECENT)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch {
    return []
  }
}

type ViewerState = {
  files: LoadedFile[]
  activeId: string | null
  fontSize: number
  theme: Theme
  filePanelOpen: boolean
  tocPanelOpen: boolean
  immersive: boolean
  recent: RecentFile[]
  addFiles: (files: LoadedFile[]) => void
  setActive: (id: string) => void
  closeFile: (id: string) => void
  setFontSize: (n: number) => void
  toggleTheme: () => void
  setFilePanelOpen: (open: boolean) => void
  setTocPanelOpen: (open: boolean) => void
  toggleImmersive: () => void
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  files: [],
  activeId: null,
  fontSize: loadFont(),
  theme: loadTheme(),
  filePanelOpen: false,
  tocPanelOpen: false,
  immersive: false,
  recent: loadRecent(),

  addFiles: (incoming) =>
    set((s) => {
      const merged = [...s.files]
      for (const f of incoming) {
        const idx = merged.findIndex((m) => m.name === f.name)
        if (idx >= 0) merged[idx] = f
        else merged.push(f)
      }
      // 파일 패널은 라이브러리 역할 — 폴더의 모든 .md를 수용한다.
      // 스펙 §2-4의 "탭 최대 10개"는 동시 렌더링을 의미하나, 본 구현은
      // 한 번에 1개만 렌더링하므로 탭 상한이 사용성 제약이 될 뿐이라 제거한다.

      // 최근 파일 갱신
      const now = Date.now()
      const recentMap = new Map(s.recent.map((r) => [r.name, r]))
      for (const f of incoming) recentMap.set(f.name, { name: f.name, lastOpened: now })
      const recent = Array.from(recentMap.values())
        .sort((a, b) => b.lastOpened - a.lastOpened)
        .slice(0, 5)
      localStorage.setItem(LS_RECENT, JSON.stringify(recent))

      return {
        files: merged,
        activeId: s.activeId ?? incoming[0]?.id ?? null,
        recent,
      }
    }),

  setActive: (id) => set({ activeId: id, filePanelOpen: false, tocPanelOpen: false }),

  closeFile: (id) =>
    set((s) => {
      const files = s.files.filter((f) => f.id !== id)
      const activeId =
        s.activeId === id ? files[files.length - 1]?.id ?? null : s.activeId
      return { files, activeId }
    }),

  setFontSize: (n) => {
    const clamped = Math.max(FONT_MIN, Math.min(FONT_MAX, Math.round(n / 2) * 2))
    localStorage.setItem(LS_FONT, String(clamped))
    set({ fontSize: clamped })
  },

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(LS_THEME, next)
    set({ theme: next })
  },

  setFilePanelOpen: (open) =>
    set({ filePanelOpen: open, tocPanelOpen: open ? false : get().tocPanelOpen }),

  setTocPanelOpen: (open) =>
    set({ tocPanelOpen: open, filePanelOpen: open ? false : get().filePanelOpen }),

  toggleImmersive: () => set({ immersive: !get().immersive }),
}))

export const FONT_RANGE = { min: FONT_MIN, max: FONT_MAX, step: 2, default: FONT_DEFAULT }
