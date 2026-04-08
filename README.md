# MD Viewer

노안 친화적인 모바일 우선 마크다운 뷰어 PWA. Cowork 등에서 내보낸 `.md` 파일을 큰 글씨로 편하게 읽기 위해 만들었습니다.

**Live**: https://dkmin7545.github.io/md-viewer/

## 주요 기능

- **큰 글씨 기본** — 기본 18px, 14–28px 슬라이더, line-height 1.7 고정
- **파일/폴더/드래그앤드롭 열기** — 폴더 선택 시 하위 `.md` 일괄 로드
- **세션 복원** — 새로고침해도 열려 있던 파일과 활성 탭이 그대로 유지 (IndexedDB, 50개 / 5MB)
- **모바일로 보내기 (P2P)** — 맥북에서 📤 누르면 6자리 코드와 QR이 뜨고, 모바일에서 코드 입력 또는 카메라로 QR 스캔하면 파일이 직접 P2P 전송됨 (서버 안 거침)
- **PWA / 오프라인** — 홈 화면에 설치 가능, 한 번 받은 파일은 비행기 모드에서도 열람
- **다크/라이트 테마**, **TOC 패널**, **전체화면 모드**

## 사용 흐름

1. 맥북 브라우저에서 폴더 열기 → 읽고 싶은 파일들 로드
2. TopBar의 📤 → 모달의 QR을 모바일 카메라로 스캔 (또는 6자리 코드 직접 입력)
3. 모바일 PWA에 파일 도착 → 이동 중 오프라인으로 열람
4. 다른 폴더로 넘어갈 땐 ☰ → "전체삭제" 후 새 폴더 보내기

## 개발

```bash
npm install
npm run dev      # http://localhost:5173/md-viewer/
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 로컬 미리보기
```

main 브랜치에 push하면 GitHub Actions가 GitHub Pages에 자동 배포합니다 ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## 스택

- React 18 + TypeScript + Vite
- Zustand (상태) · idb-keyval (세션 영속화)
- react-markdown + remark-gfm + react-syntax-highlighter
- PeerJS (WebRTC P2P 파일 전송) · qrcode
- vite-plugin-pwa (서비스 워커 / 오프라인 캐시)

## 아키텍처

```
src/
├── store/viewerStore.ts     # Zustand: files, activeId, fontSize, theme, session 영속화
├── hooks/useFiles.ts        # 파일 업로드/드롭 처리
├── lib/peerSync.ts          # PeerJS 기반 sender/receiver
├── components/
│   ├── TopBar.tsx           # 메뉴, 파일/폴더 열기, 📤 보내기, 📥 받기
│   ├── MarkdownView.tsx     # 본문 렌더 (max-width 680px)
│   ├── FilePanel.tsx        # 좌측 슬라이드 패널: 파일 목록 + 전체삭제
│   ├── TocPanel.tsx         # 우측 슬라이드 패널: 헤딩 목차
│   ├── FontSizeBar.tsx      # 하단 항상 보이는 폰트 슬라이더
│   ├── SendModal.tsx        # QR + 6자리 코드 표시
│   └── JoinPrompt.tsx       # 코드 입력 → 수신
└── App.tsx                  # 레이아웃 + ?join=<code> URL 자동 처리
```

자세한 요건은 [md-viewer-requirements.md](md-viewer-requirements.md) 참고.

## 비범위

- 양방향 동기화 (Syncthing 대체 아님 — 일회성 스냅샷 전송 모델)
- `[[wikilink]]`, Mermaid 다이어그램
- 이미지 로컬 경로 (URL만 지원)
