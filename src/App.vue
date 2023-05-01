<script setup lang="ts">
import Editor from './Editor.vue'
import { currentWorkspace, currentWorkspaceId } from './store'
</script>

<template>
  <Suspense>
    <template #fallback>
      <div>Loading...</div>
    </template>

    <Editor v-if="currentWorkspace" :workspace="currentWorkspace" />
  </Suspense>
</template>
