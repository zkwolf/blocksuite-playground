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
        <div p2 w-240px>
          <NuxtLink to="/">Back home</NuxtLink>
          <hr />
          <PageList :workspace-id="workspaceId" />
          <hr />
        </div>
        <Editor :workspace-id="workspaceId" :page-id="pageId" />
      </div>
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
