import { lazy, Suspense } from 'react'

// react-syntax-highlighter는 무거우므로 코드블록이 처음 등장할 때만 로드
const Highlighter = lazy(async () => {
  const mod = await import('react-syntax-highlighter')
  return { default: mod.Prism }
})

export function CodeBlock({ language, value }: { language: string; value: string }) {
  return (
    <Suspense
      fallback={
        <pre>
          <code>{value}</code>
        </pre>
      }
    >
      <Highlighter language={language} PreTag="div">
        {value}
      </Highlighter>
    </Suspense>
  )
}
