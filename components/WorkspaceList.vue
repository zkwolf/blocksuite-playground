<script setup lang="ts">
import { Job } from '@blocksuite/store';

const router = useRouter()

async function handleOpen(workspaceId: string) {
  const workspace = await initWorkspace(workspaceId)
  const pageId = workspace.meta.pageMetas[0].id
  const page = workspace.getPage(pageId)
  await page?.load()
  router.push(`/${workspaceId}/${pageId}`)
}

async function handleDelete(id: string) {
  const provider = createProvider(id, { connect: false })
  await provider.cleanup()

  if (provider.connected) provider.disconnect()
  workspaceIds.value = workspaceIds.value.filter((i) => i !== id)
  workspaces.delete(id)
}

function handleAdd() {
  // eslint-disable-next-line no-alert
  const id = prompt('Workspace ID')
  if (!id) return

  if (workspaceIds.value.includes(id)) {
    // eslint-disable-next-line no-alert
    alert('Workspace ID already exists')
    return
  }

  workspaceIds.value.push(id)
}

async function handleSync() {
  const fileHandle = await window.showDirectoryPicker()!;

  for await (let [key, workspaceHandle] of fileHandle.entries()) {
    console.log(key, workspaceHandle)
    const workspaceId = key + '-import'
    const workspace = createWorkspace(workspaceId)
    const job = new Job({ workspace })

    for await (let pageHandle of workspaceHandle.values()) {
      const file = await pageHandle.getFile()
      const text = await file.text()
      const json = JSON.parse(text)
      job.snapshotToPage(json);
    }
    workspaceIds.value.push(workspaceId)
  }
}
  
</script>

<template>
  <div flex="~ wrap gap5" p5 justify-start>
    <div
      v-for="id in workspaceIds"
      :key="id"
      class="card"
      @click="handleOpen(id)"
    >
      <span>{{ id }}</span>
      <button @click.stop="handleDelete(id)">delete</button>
    </div>
    <div class="card !justify-center" items-center @click="handleAdd">
      <span font-bold text-lg>Add Workspace</span>
    </div>
    <div class="card !justify-center" items-center @click="handleSync">
      <span font-bold text-lg>Open Local Workspace</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  --at-apply: 'w-200px h-150px p5 rounded-5 flex flex-col justify-between shadow-md transition-all transition-delay-200 transition-ease-in-out cursor-pointer';
}
</style>
