import {
  IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'
import { assertExists } from '@blocksuite/store'
import { useLocalStorage } from '@vueuse/core'
import { computed, watch, watchEffect } from 'vue'

export const workspaceIds = useLocalStorage<string[]>('workspaces', [])
watchEffect(() => {
  if (workspaceIds.value === null || workspaceIds.value.length === 0) {
    workspaceIds.value = ['demo-workspace']
  }
})

const workspaceMap = new Map<string, Workspace>()
export const providers: Map<string, IndexedDBProvider> = new Map()

function registerWorkspace(key: string, workspace: Workspace) {
  workspace.register(AffineSchemas)

  const provider = createIndexedDBProvider(key, workspace.doc)
  providers.set(key, provider)
  provider.connect()
  provider.whenSynced.then(() => {
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
  })

  workspaceMap.set(key, workspace)

  return workspace
}

export const currentWorkspaceId = useLocalStorage<string>(
  'current-workspace',
  'demo-workspace'
)
watch(
  currentWorkspaceId,
  () => {
    if (!currentWorkspaceId.value && workspaceIds.value.length > 0) {
      currentWorkspaceId.value = workspaceIds.value[0]
    }
  },
  { immediate: true }
)
export const currentWorkspace = computed(() => {
  if (!currentWorkspaceId.value) return null
  const workspace = workspaceMap.get(currentWorkspaceId.value)
  if (workspace) return workspace

  return registerWorkspace(
    currentWorkspaceId.value,
    new Workspace({
      id: currentWorkspaceId.value,
    })
  )
})

watch(currentWorkspaceId, (val, oldVal) => {
  if (val === oldVal) return

  const provider = providers.get(oldVal)
  assertExists(provider)
  provider.disconnect()
})
