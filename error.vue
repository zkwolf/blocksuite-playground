<script setup lang="ts">
defineProps<{ error: any }>()
</script>

<template>
  <div class="relative font-sans" n="green6">
    <div class="container max-w-200 mx-auto py-10 px-4">
      <h1>{{ error.message }}</h1>

      <NuxtLink to="/">Navigate home</NuxtLink>
    </div>
  </div>
</template>
