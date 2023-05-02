<script setup lang="ts">
definePageMeta({
  name: 'Workspace',
})

const workspaceId = useWorkspaceId()
watchEffect(() => {
  if (!workspaceIds.value.includes(workspaceId.value!)) {
    workspaceIds.value.push(workspaceId.value!)
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
        <Editor :workspace-id="workspaceId!" />
      </div>
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
