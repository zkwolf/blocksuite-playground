<script setup lang="ts">
const router = useRouter()

function handleOpen(id: string) {
  router.push(`/${id}/page0`)
}

function handleDelete(id: string) {
  workspaceIds.value = workspaceIds.value.filter((i) => i !== id)
}

function handleAdd() {
  // eslint-disable-next-line no-alert
  const id = prompt('Workspace ID')
  if (!id) return

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
    <div class="card">
      <button @click="handleAdd">Add Workspace</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  --at-apply: 'w-200px h-150px p5 rounded-5 flex flex-col justify-between shadow-md transition-all transition-delay-200 transition-ease-in-out cursor-pointer';
}
</style>
