<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
definePageMeta({
  name: 'WorkspacePage',
})
const workspaceId = useRouteParams<string>('workspaceId')
const pageId = useRouteParams<string>('pageId')
</script>

<template>
  <ClientOnly>
    <Suspense>
      <template #fallback>
        <div>Loading...</div>
      </template>

      <div flex>
        <div p2 w-260px border-r-2 border-r-solid border-r-gray-300>
          <NuxtLink to="/">Back home</NuxtLink>
          <a-divider />
          <PageList :workspace-id="workspaceId" />
        </div>
        <Editor :workspace-id="workspaceId" :page-id="pageId" />
        <!-- <Editor :workspace-id="workspaceId" :page-id="pageId" mode="edgeless" /> -->
      </div>
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
