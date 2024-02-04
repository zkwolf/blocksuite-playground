<script setup lang="ts">
const workspaceId = defineProp<string>('workspaceId', { required: true })
const pageId = defineProp<string>('pageId', { required: true })

const container = ref<HTMLDivElement>()

const editor = useEditor(workspaceId, pageId)
await until(editor).toBeTruthy()

watchEffect((onCleanup) => {
  if (!editor.value || !container.value) return
  const _editor = editor.value
  window.editor = editor.value
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
