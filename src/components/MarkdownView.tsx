import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useViewerStore } from '../store/viewerStore'
import { extractHeadings, slugify } from '../lib/headings'
import { CodeBlock } from './CodeBlock'

// 본문 텍스트(자식 노드 → 문자열)
function nodeText(children: any): string {
  if (children == null) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(nodeText).join('')
  if (typeof children === 'object' && 'props' in children) return nodeText(children.props.children)
  return ''
}

export function MarkdownView() {
  const file = useViewerStore((s) => s.files.find((f) => f.id === s.activeId) ?? null)

  // 헤딩 id를 본문 렌더와 TOC 모두 동일한 규칙으로 매기기 위해 store는 별도 카운터를 사용
  // (extractHeadings는 TocPanel에서 호출됨)
  const slugCounter = useMemo(() => new Map<string, number>(), [file?.id])

  if (!file) {
    return (
      <div className="markdown-body" style={{ color: 'var(--mdv-muted)' }}>
        <p>왼쪽 위 버튼으로 .md 파일을 열거나, 이 영역에 파일을 드래그하세요.</p>
      </div>
    )
  }

  const headingRenderer = (level: 1 | 2 | 3) =>
    function H({ children, ...props }: any) {
      const text = nodeText(children)
      const id = slugify(text, slugCounter)
      const Tag = (`h${level}` as unknown) as any
      return (
        <Tag id={id} {...props}>
          {children}
        </Tag>
      )
    }

  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: headingRenderer(1),
          h2: headingRenderer(2),
          h3: headingRenderer(3),
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            if (!inline && match) {
              return (
                <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
              )
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {file.content}
      </ReactMarkdown>
    </article>
  )
}

export { extractHeadings }
