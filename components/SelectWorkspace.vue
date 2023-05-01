<script setup lang="ts">
const router = useRouter()
function handleChange(evt: Event) {
  const id = (evt.target as HTMLSelectElement).value
  router.push(`/${id}`)
}
</script>

<template>
  <div>
    <select @change="handleChange">
      <option v-for="id in workspaceIds" :key="id" :value="id">{{ id }}</option>
    </select>
  </div>
</template>
