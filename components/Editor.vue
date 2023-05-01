<script setup lang="ts">
import { assertExists } from '@blocksuite/store'

const workspaceId = defineProp<string>('workspaceId', { required: true })

const container = ref<HTMLDivElement>()

const editor = useEditor(workspaceId)
await until(editor).toBeTruthy()

watchEffect((onCleanup) => {
  if (!editor.value || !container.value) return
  const _editor = editor.value
  container.value.append(_editor)

  onCleanup(() => {
    container.value!.removeChild(_editor)
  })
})

// disconnect provider
watch(workspaceId, (val, oldVal) => {
  const provider = providers.get(oldVal)
  assertExists(provider)
  provider.disconnect()
})
</script>

<template>
  <div ref="container" class="editor-container" />
</template>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
}
</style>
