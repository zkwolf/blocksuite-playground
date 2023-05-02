<template>
  <ClientOnly>
    <main>
      <WorkspaceList />
    </main>

    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
