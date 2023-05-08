import { type PageMeta } from '@blocksuite/store'
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
    return initWorkspace(resolveUnref(workspaceId))
  }, null)

  const pages = ref<PageMeta[]>()

  function refreshPages() {
    if (!workspace.value) return
    pages.value = workspace.value.meta.pageMetas
  }

  watchEffect((onCleanup) => {
    if (!workspace.value) return
    refreshPages()

    const dispose = workspace.value.slots.pagesUpdated.on(() => {
      refreshPages()
      onCleanup(() => dispose.dispose())
    })
  })

  return { workspace, pages }
}

export function useEditor(
  workspaceId: MaybeRefOrGetter<string>,
  pageId: MaybeRefOrGetter<string>,
  mode: MaybeRefOrGetter<'page' | 'edgeless'> = 'page'
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

    return getEditor(workspace.value, _pageId, resolveUnref(mode))
  }, null)
}
