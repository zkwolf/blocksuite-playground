<script setup lang="ts">
import { assertExists } from '@blocksuite/global/utils'
import { MarkdownTransformer } from '@blocksuite/blocks'
import { useRouteParams } from '@vueuse/router'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { Text } from '@blocksuite/store'

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
  const text = chatText.value
  if (!text) {
    return
  }

  const requestData = {
    model: 'qwen:7b',
    messages: [
      {
        role: 'user',
        content: text,
      },
    ],
    stream: false,
  }
  fetch(`http://127.0.0.1:11434/api/chat`, {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
    .then(async (res) => {
      // todo: check res code
      const data = await res.json()
      console.log(data.message.content)
      chatText.value = data.message.content
    })
    .catch((err) => {
      console.error(err)
    })
}

async function handleGenerate() {
  const text = chatText.value
  if (!text) {
    return
  }

  const page = window.page
  //console.log(page.getBlockByFlavour('affine:paragraph'))
  // console.log(window.editor.host)
  // const host = window.editor.host
  // const selection = host.selection
  // console.log(selection)
  const noteBlock = window.page.getBlockByFlavour('affine:note')

  const requestData = {
    model: 'qwen:7b',
    messages: [
      {
        role: 'system',
        content:
          `作为写作专家，您的任务是提高提供给您的文本的质量。您的角色涉及以下步骤：

评估文本：仔细阅读文本，了解其内容和意图。
改进文本：重写文本以提高清晰度、连贯性和吸引力。确保风格和语气与预期受众一致且恰当。
纠正错误：识别和纠正任何语法、拼写、标点或句法错误。
调整长度：根据用户的要求，要么压缩文本以使其更简洁，而不丢失基本信息，要么详细阐述观点，提供更详细和扩展的版本。
提供反馈：修改后，简要解释您所做的主要更改及原因，以帮助用户理解改进之处。`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    stream: false,
  }
  fetch(`http://127.0.0.1:11434/api/chat`, {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
    .then(async (res) => {
      // todo: check res code
      const data = await res.json()
      chatText.value = ''
      const page = window.page
      const text = data.message.content
      console.log(text)
      page.addBlock(
        'affine:paragraph',
        { type: 'text', text: new Text(text) },
        noteBlock[0].id
      )
    })
    .catch((err) => {
      console.error(err)
    })
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
    <a-button @click="handleGenerate">Generate</a-button>
  </div>
</template>
