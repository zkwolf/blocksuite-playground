<script setup lang="ts">
const route = useRoute()

const workspaceId = computed(() => route.params.workspaceId as string)
</script>

<template>
  <ClientOnly>
    <Suspense>
      <template #fallback>
        <div>Loading...</div>
      </template>
      <Editor :workspace-id="workspaceId" />
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
