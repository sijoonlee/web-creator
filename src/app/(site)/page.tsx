import { BlockRenderer } from '@/renderer/BlockRenderer'
import { demoPage } from '@/content/demoPage'

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand">Web Creator</div>
        <nav aria-label="Primary">
          <a href="/editor">Editor</a>
          <a href="/admin">Admin</a>
          <a href="/preview/demo">Preview</a>
        </nav>
      </header>
      <BlockRenderer blocks={demoPage.blocks} />
    </main>
  )
}
