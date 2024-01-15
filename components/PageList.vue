<script setup lang="ts">
import { assertExists } from '@blocksuite/global/utils'
import { useRouteParams } from '@vueuse/router'
import { nanoid } from 'nanoid'

const workspaceId = defineProp<string>('workspaceId', { required: true })

const pageId = useRouteParams('pageId')

const { workspace, pages } = useWorkspace(workspaceId)
await until(pages).toBeTruthy()

function handleAdd() {
  assertExists(workspace.value)
  assertExists(pages.value)

  const id = nanoid()
  const page = workspace.value.createPage({ id })
  initPage(page)
}

async function handleDelete(id: string) {
  assertExists(workspace.value)
  assertExists(pages.value)

  if (pageId.value === id) {
    pageId.value = pages.value.find((p) => p.id !== id)!.id
    await until(pageId).not.toBe(id)
  }

  workspace.value.removePage(id)
}
</script>

<template>
  <div flex="~ col gap2">
    <div v-for="page in pages!" :key="page.id" flex="~ gap2">
      <NuxtLink :to="`/${workspaceId}/${page.id}`">
        {{ page.id }} - {{ page.title }}
      </NuxtLink>
      <button v-if="pages!.length > 1" @click="handleDelete(page.id)">
        delete
      </button>
    </div>

    <button p1 @click="handleAdd">Add page</button>
  </div>
</template>
