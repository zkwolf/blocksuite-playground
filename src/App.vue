<script setup lang="ts">
import Editor from './Editor.vue'
import { currentWorkspace } from './store'
</script>

<template>
  <Suspense>
    <template #fallback>
      <div>Loading...</div>
    </template>

    <Editor :workspace="currentWorkspace" />
  </Suspense>
</template>
