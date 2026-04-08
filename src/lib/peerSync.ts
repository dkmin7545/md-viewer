// 맥북 ↔ 모바일 간 일회성 P2P 파일 전송.
// PeerJS 공개 브로커를 시그널링으로 쓰고, 파일은 직접 P2P로 흐른다.
//
// 코드 체계: 6자리 영숫자(소문자+숫자, ambiguous 제외).
// 실제 PeerJS ID는 'mdv-<code>' 네임스페이스로 충돌을 피한다.

import { detectKind, type LoadedFile } from '../store/viewerStore'

const PEER_PREFIX = 'mdv-'
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // 0/1/i/l/o 제외

export function generateCode(): string {
  let s = ''
  const buf = new Uint8Array(6)
  crypto.getRandomValues(buf)
  for (let i = 0; i < 6; i++) s += ALPHABET[buf[i] % ALPHABET.length]
  return s
}

type Peer = import('peerjs').Peer
type DataConnection = import('peerjs').DataConnection

async function loadPeer(): Promise<typeof import('peerjs')> {
  return await import('peerjs')
}

export type SenderHandle = {
  code: string
  close: () => void
  onStatus: (cb: (status: SenderStatus) => void) => void
}

export type SenderStatus =
  | { kind: 'waiting' }
  | { kind: 'sending' }
  | { kind: 'done' }
  | { kind: 'error'; message: string }

export async function createSender(files: LoadedFile[]): Promise<SenderHandle> {
  const { Peer } = await loadPeer()
  const code = generateCode()
  const peer: Peer = new Peer(PEER_PREFIX + code, { debug: 1 })

  let statusCb: ((s: SenderStatus) => void) | null = null
  const setStatus = (s: SenderStatus) => statusCb?.(s)

  const connections: DataConnection[] = []

  await new Promise<void>((resolve, reject) => {
    peer.on('open', () => resolve())
    peer.on('error', (err) => reject(err))
    setTimeout(() => reject(new Error('PeerJS 브로커 연결 시간 초과')), 10000)
  })

  setStatus({ kind: 'waiting' })

  peer.on('connection', (conn) => {
    connections.push(conn)
    conn.on('open', () => {
      setStatus({ kind: 'sending' })
      // lastOpened는 수신측에서 새로 찍게 비움
      const payload = files.map(({ id, name, content, kind }) => ({
        id,
        name,
        content,
        kind,
      }))
      conn.send({ type: 'files', files: payload })
      // 살짝 지연 후 done 표시 (PeerJS는 ack가 없으므로 best-effort)
      setTimeout(() => setStatus({ kind: 'done' }), 800)
    })
    conn.on('error', (err) => setStatus({ kind: 'error', message: String(err) }))
  })

  peer.on('error', (err) => {
    setStatus({ kind: 'error', message: err?.message ?? String(err) })
  })

  return {
    code,
    close: () => {
      try {
        for (const c of connections) c.close()
        peer.destroy()
      } catch {
        /* ignore */
      }
    },
    onStatus: (cb) => {
      statusCb = cb
    },
  }
}

export async function joinAsReceiver(
  code: string,
  timeoutMs = 15000,
): Promise<LoadedFile[]> {
  const { Peer } = await loadPeer()
  const normalized = code.trim().toLowerCase()
  if (!/^[a-z0-9]{6}$/.test(normalized)) {
    throw new Error('코드는 6자리 영숫자여야 합니다.')
  }

  const peer: Peer = new Peer(undefined as unknown as string, { debug: 1 })

  await new Promise<void>((resolve, reject) => {
    peer.on('open', () => resolve())
    peer.on('error', (err) => reject(err))
    setTimeout(() => reject(new Error('PeerJS 브로커 연결 시간 초과')), 10000)
  })

  return await new Promise<LoadedFile[]>((resolve, reject) => {
    const conn = peer.connect(PEER_PREFIX + normalized, { reliable: true })
    const timer = setTimeout(() => {
      try {
        conn.close()
        peer.destroy()
      } catch {
        /* ignore */
      }
      reject(new Error('전송 시간 초과 — 코드를 확인하거나 다시 시도하세요.'))
    }, timeoutMs)

    conn.on('open', () => {
      // 송신측이 자동으로 보낸다 — 별도 요청 불필요
    })
    conn.on('data', (data: unknown) => {
      const d = data as { type?: string; files?: LoadedFile[] }
      if (d?.type === 'files' && Array.isArray(d.files)) {
        clearTimeout(timer)
        // 구버전 송신은 kind가 없을 수 있다 → 파일명에서 추론
        const filled = d.files.map((f) => ({
          ...f,
          kind: f.kind ?? detectKind(f.name) ?? 'md',
        }))
        resolve(filled)
        setTimeout(() => {
          try {
            conn.close()
            peer.destroy()
          } catch {
            /* ignore */
          }
        }, 200)
      }
    })
    conn.on('error', (err) => {
      clearTimeout(timer)
      reject(err instanceof Error ? err : new Error(String(err)))
    })
    peer.on('error', (err) => {
      clearTimeout(timer)
      reject(err instanceof Error ? err : new Error(String(err)))
    })
  })
}
