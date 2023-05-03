<script setup lang="ts">
const workspaceId = defineProp<string>('workspaceId', { required: true })
const pageId = defineProp<string>('pageId', { required: true })
const mode = defineProp<'page' | 'edgeless'>('mode', { default: 'page' })

const container = ref<HTMLDivElement>()

const editor = useEditor(workspaceId, pageId, mode)
await until(editor).toBeTruthy()

watchEffect((onCleanup) => {
  if (!editor.value || !container.value) return
  const _editor = editor.value
  container.value.append(_editor)

  onCleanup(() => {
    _editor.remove()
  })
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
