<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const workspaceId = computed(
  () => route.name === 'Workspace' && (route.params.workspaceId as string)
)

function handleChange(evt: Event) {
  const id = (evt.target as HTMLSelectElement).value
  router.push(`/${id}`)
}
</script>

<template>
  <div>
    <select @change="handleChange">
      <option value="">Select workspace</option>
      <option
        v-for="id in workspaceIds"
        :key="id"
        :value="id"
        :selected="id === workspaceId"
      >
        {{ id }}
      </option>
    </select>
  </div>
</template>
