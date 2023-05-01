<template>
  <ClientOnly>
    <SelectWorkspace />

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
