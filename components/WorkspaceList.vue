<script setup lang="ts">
const router = useRouter()

async function handleOpen(workspaceId: string) {
  const pageId = (await getWorkspace(workspaceId)).meta.pageMetas[0].id
  router.push(`/${workspaceId}/${pageId}`)
}

async function handleDelete(id: string) {
  const workspace = await getWorkspace(id)
  workspace.meta.pageMetas.map((page) => workspace.removePage(page.id))

  workspaceIds.value = workspaceIds.value.filter((i) => i !== id)
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
  </div>
</template>

<style scoped>
.card {
  --at-apply: 'w-200px h-150px p5 rounded-5 flex flex-col justify-between shadow-md transition-all transition-delay-200 transition-ease-in-out cursor-pointer';
}
</style>
