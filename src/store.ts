import {
  IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'
import { assertExists } from '@blocksuite/store'
import { computedAsync, useLocalStorage } from '@vueuse/core'
import { watch, watchEffect } from 'vue'

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

  const provider = createIndexedDBProvider(id, workspace.doc)
  providers.set(id, provider)

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

export const currentWorkspaceId = useLocalStorage<string>(
  'current-workspace',
  'demo-workspace'
)

// fallback currentWorkspaceId to the first workspace
watch(
  currentWorkspaceId,
  () => {
    if (!currentWorkspaceId.value && workspaceIds.value.length > 0) {
      currentWorkspaceId.value = workspaceIds.value[0]
    }
  },
  { immediate: true }
)

// disconnect provider
watch(currentWorkspaceId, (val, oldVal) => {
  const provider = providers.get(oldVal)
  assertExists(provider)
  provider.disconnect()
})

export const currentWorkspace = computedAsync(() => {
  if (!currentWorkspaceId.value) return null
  const workspace =
    workspaceMap.get(currentWorkspaceId.value) ||
    createWorkspace(currentWorkspaceId.value)

  return switchWorkspace(currentWorkspaceId.value, workspace)
})
