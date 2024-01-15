import { type Workspace } from '@blocksuite/store'
import { assertExists } from '@blocksuite/global/utils'

export async function createEditor(
  workspace: Workspace,
  pageId: string
) {
  const { AffineDocEditor } = await import('@blocksuite/presets')
  const editor = new AffineDocEditor()
  const page = workspace.getPage(pageId)
  assertExists(page)
  editor.page = page
  return editor
}

export const getEditor = useMemoize(createEditor, {
  getKey(workspace, pageId) {
    return JSON.stringify({ workspaceId: workspace.id, pageId })
  },
})
