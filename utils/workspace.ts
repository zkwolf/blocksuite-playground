import {
  type IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace, assertExists } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'

export const workspaceMap = new Map<string, Workspace>()
export const providers: Map<string, IndexedDBProvider> = new Map()

export function createWorkspace(id: string) {
  const workspace = new Workspace({ id })
  workspace.register(AffineSchemas)
  workspaceMap.set(id, workspace)

  const provider = createIndexedDBProvider(id, workspace.doc)
  provider.connect()
  providers.set(id, provider)
  return workspace
}

export async function switchWorkspace(key: string, workspace: Workspace) {
  const provider = providers.get(key)
  assertExists(provider)

  await provider.whenSynced
  if (workspace.getPageNameList().length === 0) {
    const page = workspace.createPage({
      id: 'index',
    })

    const pageBlockId = page.addBlock('affine:page', {
      title: new Text(),
    })

    page.addBlock('affine:surface', {}, null)

    // Add frame block inside page block
    const frameId = page.addBlock('affine:frame', {}, pageBlockId)
    // Add paragraph block inside frame block
    page.addBlock('affine:paragraph', {}, frameId)
    page.resetHistory()
  }
  return workspace
}

export function getWorkspace(id: string) {
  const workspace = workspaceMap.get(id) || createWorkspace(id)
  return switchWorkspace(id, workspace)
}
