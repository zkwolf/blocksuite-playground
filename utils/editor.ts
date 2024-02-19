import { Page, type Workspace } from '@blocksuite/store'
import { assertExists } from '@blocksuite/global/utils'

export async function createEditor(
  workspace: Workspace,
  pageId: string
) {
  const { AffineEditorContainer } = await import('@blocksuite/presets')
  const editor = new AffineEditorContainer()
  const page = workspace.getPage(pageId)
  await page?.load()
  assertExists(page)
  if (!page.root) {
    await new Promise(resolve => page.slots.rootAdded.once(resolve))
  }
  editor.page = page
  return editor
}

export const getEditor = useMemoize(createEditor, {
  getKey(workspace, pageId) {
    return JSON.stringify({ workspaceId: workspace.id, pageId })
  },
})
