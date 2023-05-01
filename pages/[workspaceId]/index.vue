<script setup lang="ts">
definePageMeta({
  name: 'Workspace',
})

const route = useRoute()
const workspaceId = computed(() => route.params.workspaceId as string)

watchEffect(() => {
  if (!workspaceIds.value.includes(workspaceId.value)) {
    workspaceIds.value.push(workspaceId.value)
  }
})
</script>

<template>
  <ClientOnly>
    <Suspense>
      <template #fallback>
        <div>Loading...</div>
      </template>

      <div>
        <SelectWorkspace />
        <Editor :workspace-id="workspaceId" />
      </div>
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
