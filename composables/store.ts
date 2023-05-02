import { type PageMeta, assertExists } from '@blocksuite/store'
import { type MaybeRefOrGetter } from '@vueuse/core'

export const workspaceIds = useLocalStorage<string[]>('workspaces', [])

export function useWorkspace(workspaceId: MaybeRefOrGetter<string>) {
  if (process.server) {
    return { workspace: ref(null), pages: ref(undefined) }
  }
  const workspace = computedAsync(() => {
    const id = resolveUnref(workspaceId)
    if (!workspaceIds.value.includes(id)) {
      throw showError({
        statusCode: 404,
        statusMessage: `Workspace ${id} Not Found`,
      })
    }
    return getWorkspace(resolveUnref(workspaceId))
  }, null)

  const pages = ref<PageMeta[]>()

  watchEffect((onCleanup) => {
    if (!workspace.value) return
    pages.value = workspace.value.meta.pageMetas
    const dispose = workspace.value.slots.pageAdded.on(() => {
      assertExists(workspace.value)
      pages.value = workspace.value.meta.pageMetas
      onCleanup(() => {
        dispose.dispose()
      })
    })
  })

  return { workspace, pages }
}

export function useEditor(
  workspaceId: MaybeRefOrGetter<string>,
  pageId: MaybeRefOrGetter<string>
) {
  const { workspace, pages } = useWorkspace(workspaceId)

  return computedAsync(() => {
    if (!workspace.value || !pages.value) return null

    const _pageId = resolveUnref(pageId)
    if (!pages.value.some((page) => page.id === _pageId)) {
      throw showError({
        statusCode: 404,
        statusMessage: `Page ${_pageId} Not Found`,
      })
    }

    return getEditor(workspace.value, _pageId)
  }, null)
}
