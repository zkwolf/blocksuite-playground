<script setup lang="ts">
import { ref, watch } from 'vue'
import { providers } from './store'
import { Workspace, assertExists } from '@blocksuite/store'
import { computedAsync, until } from '@vueuse/core'

const props = defineProps<{
  workspace: Workspace
}>()

const container = ref<HTMLDivElement>()

const { EditorContainer } = await import('@blocksuite/editor')

const editor = computedAsync(async () => {
  const editor = new EditorContainer()
  const provider = providers.get(props.workspace.id)
  assertExists(provider)
  await provider.whenSynced
  const page = props.workspace.getPage('page0')
  assertExists(page)
  editor.page = page
  return editor
})

await until(editor).toBeTruthy()

watch([editor, container], ([editor], _oldVal, onCleanup) => {
  if (!editor || !container.value) return
  container.value.append(editor)
  onCleanup(() => {
    container.value!.removeChild(editor)
  })
})
</script>

<template>
  <div ref="container" id="editor-container"></div>
</template>
