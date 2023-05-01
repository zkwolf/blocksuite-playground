<script setup lang="ts">
import {
  IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { EditorContainer } from '@blocksuite/editor'
import { Workspace } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'
import { assertExists } from '@blocksuite/store'
import { computedAsync, useLocalStorage } from '@vueuse/core'
import { computed, ref, watch, watchEffect } from 'vue'

const workspaceIds = useLocalStorage<string[]>('workspaces', [])
watchEffect(() => {
  if (workspaceIds.value === null || workspaceIds.value.length === 0) {
    workspaceIds.value = ['demo-workspace']
  }
})
const workspaceMap = new Map<string, Workspace>()
const providers: Map<string, IndexedDBProvider> = new Map()

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

const currentWorkspaceId = useLocalStorage<string>(
  'current-workspace',
  'demo-workspace'
)
const currentWorkspace = computed(() => {
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

const editor = computedAsync(async () => {
  const workspace = currentWorkspace.value
  if (!workspace) return null
  const editor = new EditorContainer()
  const provider = providers.get(workspace.id)
  assertExists(provider)
  await provider.whenSynced
  const page = workspace.getPage('page0')
  assertExists(page)
  editor.page = page
  return editor
})

const container = ref<HTMLDivElement>()

watch(editor, (editor, _oldVal, onCleanup) => {
  if (!editor || !container.value) return
  container.value.append(editor)
  onCleanup(() => {
    container.value!.removeChild(editor)
  })
})
</script>

<template>
  <div ref="container"></div>
</template>
