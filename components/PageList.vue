<script setup lang="ts">
import { assertExists } from '@blocksuite/global/utils'
import { MarkdownTransformer } from '@blocksuite/blocks';
import { useRouteParams } from '@vueuse/router'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'

const router = useRouter()

const workspaceId = defineProp<string>('workspaceId', { required: true })

const pageId = useRouteParams<string>('pageId')

const chatText = ref<string>()

const { workspace, pages } = useWorkspace(workspaceId)
await until(pages).toBeTruthy()

async function handleAdd() {
  await addPage()
}

async function addPage(title?: string) {
  assertExists(workspace.value)
  assertExists(pages.value)

  const id = nanoid()
  const page = workspace.value.createPage({ id })
  await initPage(page, title)
  router.push(`/${workspaceId.value}/${id}`)
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

async function exportPage() {
  const page = window.page
   MarkdownTransformer.exportPage(page!)
}

async function handleAddNewDaily() {
  const now = dayjs().format('YYYY-MM-DD')

  const existPageId = pages.value?.find((p) => p.title === now)?.id
  if (!existPageId) {
    await addPage(now)
  } else {
    router.push(`/${workspaceId.value}/${existPageId}`)
  }
}

async function handleChat() {
  
}

</script>

<template>
  <div flex="~ col gap2">
    <div v-for="page in pages!" :key="page.id" flex="~ gap2">
      <NuxtLink :to="`/${workspaceId}/${page.id}`">
        {{ page.title }}
      </NuxtLink>
      <a-button v-if="pages!.length > 1" @click="handleDelete(page.id)">
        delete
      </a-button>
    </div>

    <a-button p1 @click="handleAdd">Add page</a-button>
    <a-button @click="handleAddNewDaily">New Daily</a-button>
    <a-button @click="exportPage">Export page</a-button>
    <a-textarea style="height: 300px" v-model:value="chatText"></a-textarea>
    <a-button @click="handleChat">Chat</a-button>
  </div>
</template>
