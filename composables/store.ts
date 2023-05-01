import {
  IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'
import { assertExists } from '@blocksuite/store'

export const workspaceIds = useLocalStorage<string[]>('workspaces', [])
watchEffect(() => {
  if (workspaceIds.value === null || workspaceIds.value.length === 0) {
    workspaceIds.value = ['demo-workspace']
  }
})

export const workspaceMap = new Map<string, Workspace>()
export const providers: Map<string, IndexedDBProvider> = new Map()

function createWorkspace(id: string) {
  const workspace = new Workspace({ id })
  workspace.register(AffineSchemas)
  workspaceMap.set(id, workspace)

  providers.set(id, createIndexedDBProvider(id, workspace.doc))

  return workspace
}

async function switchWorkspace(key: string, workspace: Workspace) {
  const provider = providers.get(key)
  assertExists(provider)
  provider.connect()

  await provider.whenSynced
  if (workspace.isEmpty) {
    const page = workspace.createPage({
      id: 'page0',
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
  } else {
    const page = workspace.getPage('page0')
    assertExists(page)
  }
  workspaceMap.set(key, workspace)
  return workspace
}

export function getWorkspace(id: string) {
  const workspace = workspaceMap.get(id) || createWorkspace(id)
  return switchWorkspace(id, workspace)
}
