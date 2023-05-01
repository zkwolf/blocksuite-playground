<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { providers } from './store'
import { Workspace, assertExists } from '@blocksuite/store'
import { until } from '@vueuse/core'

const workspace = defineProp<Workspace>()

const container = ref<HTMLDivElement>()

const { EditorContainer } = await import('@blocksuite/editor')

const editor = computed(() => {
  if (!workspace.value) return
  const editor = new EditorContainer()
  const provider = providers.get(workspace.value.id)
  assertExists(provider)
  const page = workspace.value.getPage('page0')
  assertExists(page)
  editor.page = page
  return editor
})

await until(editor).toBeTruthy()

watchEffect((onCleanup) => {
  if (!editor.value || !container.value) return
  const _editor = editor.value
  container.value.append(_editor)

  onCleanup(() => {
    container.value!.removeChild(_editor)
  })
})
</script>

<template>
  <div ref="container" class="editor-container"></div>
</template>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
}
</style>
