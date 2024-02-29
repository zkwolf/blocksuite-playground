import { Page, type Workspace } from '@blocksuite/store'
import { assertExists } from '@blocksuite/global/utils'
import { AffineEditorContainer } from '@blocksuite/presets'

export async function createEditor(
  workspace: Workspace,
  pageId: string
) {
  const editor = new AffineEditorContainer()
  const page = workspace.getPage(pageId)
  assertExists(page)

  page?.load()
  if (!page.root) {
    await new Promise(resolve => page.slots.rootAdded.once(resolve))
  }
  editor.page = page
  editor.slots.pageLinkClicked.on(({ pageId }) => {
    const target = workspace.getPage(pageId);
    if (!target) {
      throw new Error(`Failed to jump to doc ${pageId}`);
    }
    target.load();
    editor.page = target;
  })
  return editor
}

export const getEditor = useMemoize(createEditor, {
  getKey(workspace, pageId) {
    return JSON.stringify({ workspaceId: workspace.id, pageId })
  },
})
