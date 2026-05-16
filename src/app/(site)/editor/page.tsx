import { demoPage } from '@/content/demoPage'
import { ContentEditor } from '@/editor/ContentEditor'

export default function EditorPage() {
  return <ContentEditor initialBlocks={demoPage.blocks} />
}
