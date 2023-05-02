<script setup lang="ts">
const workspaceId = defineProp<string>('workspaceId', { required: true })

const { pages } = useWorkspace(workspaceId)
await until(pages).toBeTruthy()
</script>

<template>
  <div flex="~ col">
    <NuxtLink
      v-for="page in pages!"
      :key="page.id"
      :to="`/${workspaceId}/${page.id}`"
    >
      {{ page.id }}
    </NuxtLink>
  </div>
</template>
