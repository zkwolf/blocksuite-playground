import {
  type IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'

export const workspaces = new Map<string, Workspace>()
export const providers: Map<string, IndexedDBProvider> = new Map()

export function createProvider(
  id: string,
  { connect = true }: { connect?: boolean } = {}
) {
  const workspace = createWorkspace(id)
  if (providers.has(id)) return providers.get(id)!

  const provider = createIndexedDBProvider(id, workspace.doc)
  if (connect) provider.connect()
  providers.set(id, provider)
  return provider
}

export function createWorkspace(id: string) {
  if (workspaces.has(id)) return workspaces.get(id)!

  const workspace = new Workspace({ id })
  workspace.register(AffineSchemas)
  workspaces.set(id, workspace)
  return workspace
}

export async function initWorkspace(id: string) {
  const workspace = createWorkspace(id)
  const provider = createProvider(id)

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
