import { type Workspace, assertExists } from '@blocksuite/store'

export async function createEditor(workspace: Workspace, pageId: string) {
  const { EditorContainer } = await import('@blocksuite/editor')
  const editor = new EditorContainer()
  const provider = providers.get(workspace.id)
  assertExists(provider)
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
