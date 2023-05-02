<script setup lang="ts">
import { assertExists } from '@blocksuite/store'

definePageMeta({
  name: 'WorkspacePage',
})

const route = useRoute()
const workspaceId = computed(() => route.params.workspaceId as string)
const pageId = computed(() => route.params.pageId as string)

const { workspace, pages } = useWorkspace(workspaceId)

function handleAddPage() {
  assertExists(workspace.value)
  assertExists(pages.value)

  const page = workspace.value.createPage({
    id: `page${pages.value.length}`,
  })
  initPage(page)
}
</script>

<template>
  <ClientOnly>
    <Suspense>
      <template #fallback>
        <div>Loading...</div>
      </template>

      <div flex>
        <div p2 w-120px>
          <NuxtLink to="/">Back to home</NuxtLink>
          <hr />
          <PageList :workspace-id="workspaceId" />
          <hr />
          <button @click="handleAddPage">add page</button>
        </div>
        <Editor :workspace-id="workspaceId" :page-id="pageId" />
      </div>
    </Suspense>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
