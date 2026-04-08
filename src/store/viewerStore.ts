import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'

export type FileKind = 'md' | 'html' | 'jsx'

export type LoadedFile = {
  id: string
  name: string
  content: string
  kind: FileKind
  lastOpened?: number
}

export function detectKind(name: string): FileKind | null {
  const n = name.toLowerCase()
  if (n.endsWith('.md') || n.endsWith('.markdown')) return 'md'
  if (n.endsWith('.html') || n.endsWith('.htm')) return 'html'
  if (n.endsWith('.jsx')) return 'jsx'
  return null
}

export type Theme = 'light' | 'dark'

const LS_FONT = 'mdv:fontSize'
const LS_THEME = 'mdv:theme'
const LS_RECENT = 'mdv:recent'
const IDB_SESSION = 'mdv:session'

// 세션 한도: 파일 50개 / 총 5MB
const SESSION_MAX_FILES = 50
const SESSION_MAX_BYTES = 5 * 1024 * 1024

type SessionSnapshot = { files: LoadedFile[]; activeId: string | null }

let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSaveSession(snapshot: SessionSnapshot) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void idbSet(IDB_SESSION, snapshot).catch(() => {})
  }, 200)
}

function trimToLimits(files: LoadedFile[]): LoadedFile[] {
  // lastOpened 내림차순으로 정렬, 한도 초과분 드롭
  const sorted = [...files].sort(
    (a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0),
  )
  const kept: LoadedFile[] = []
  let bytes = 0
  for (const f of sorted) {
    const size = f.content.length * 2 // UTF-16 추정
    if (kept.length >= SESSION_MAX_FILES) break
    if (bytes + size > SESSION_MAX_BYTES) break
    kept.push(f)
    bytes += size
  }
  return kept
}

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
  hydrated: boolean
  hydrateSession: () => Promise<void>
  addFiles: (files: LoadedFile[]) => void
  setActive: (id: string) => void
  closeFile: (id: string) => void
  clearAll: () => void
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
  hydrated: false,

  hydrateSession: async () => {
    if (get().hydrated) return
    try {
      const snap = (await idbGet(IDB_SESSION)) as SessionSnapshot | undefined
      if (snap && Array.isArray(snap.files) && snap.files.length > 0) {
        // 옛 세션은 kind가 없을 수 있다 → 파일명 기반 추론, 실패 시 'md' 폴백
        const withKind = snap.files.map((f) => ({
          ...f,
          kind: f.kind ?? detectKind(f.name) ?? 'md',
        }))
        const files = trimToLimits(withKind)
        const activeId =
          snap.activeId && files.find((f) => f.id === snap.activeId)
            ? snap.activeId
            : files[0]?.id ?? null
        set({ files, activeId, hydrated: true })
        return
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true })
  },

  addFiles: (incoming) =>
    set((s) => {
      const now = Date.now()
      const stamped = incoming.map((f) => ({ ...f, lastOpened: now }))
      const merged = [...s.files]
      for (const f of stamped) {
        const idx = merged.findIndex((m) => m.name === f.name)
        if (idx >= 0) merged[idx] = f
        else merged.push(f)
      }
      const trimmed = trimToLimits(merged)
      // 파일 패널은 라이브러리 역할 — 폴더의 모든 .md를 수용한다.
      // 한도(50개/5MB)를 넘으면 lastOpened 기준 오래된 항목부터 드롭.

      // 최근 파일 갱신
      const recentMap = new Map(s.recent.map((r) => [r.name, r]))
      for (const f of stamped) recentMap.set(f.name, { name: f.name, lastOpened: now })
      const recent = Array.from(recentMap.values())
        .sort((a, b) => b.lastOpened - a.lastOpened)
        .slice(0, 5)
      localStorage.setItem(LS_RECENT, JSON.stringify(recent))

      const activeId =
        s.activeId && trimmed.find((f) => f.id === s.activeId)
          ? s.activeId
          : stamped[0]?.id ?? trimmed[0]?.id ?? null

      scheduleSaveSession({ files: trimmed, activeId })

      return {
        files: trimmed,
        activeId,
        recent,
      }
    }),

  setActive: (id) =>
    set((s) => {
      const files = s.files.map((f) =>
        f.id === id ? { ...f, lastOpened: Date.now() } : f,
      )
      scheduleSaveSession({ files, activeId: id })
      return { files, activeId: id, filePanelOpen: false, tocPanelOpen: false }
    }),

  closeFile: (id) =>
    set((s) => {
      const files = s.files.filter((f) => f.id !== id)
      const activeId =
        s.activeId === id ? files[files.length - 1]?.id ?? null : s.activeId
      scheduleSaveSession({ files, activeId })
      return { files, activeId }
    }),

  clearAll: () => {
    scheduleSaveSession({ files: [], activeId: null })
    set({ files: [], activeId: null, filePanelOpen: false })
  },

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
