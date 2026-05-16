import { BlockRenderer } from '@/renderer/BlockRenderer'
import { demoPage } from '@/content/demoPage'

type PreviewPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand">Preview: {slug}</div>
        <nav aria-label="Primary">
          <a href="/">Public</a>
          <a href="/editor">Editor</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>
      <BlockRenderer blocks={demoPage.blocks} mode="preview" />
    </main>
  )
}
