import {
  type IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { type PageMeta, Workspace, assertExists } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks/models'
import { type MaybeRefOrGetter } from '@vueuse/core'

export const workspaceIds = useLocalStorage<string[]>('workspaces', [])

export const workspaceMap = new Map<string, Workspace>()
export const providers: Map<
  string,
  { provider: IndexedDBProvider; connected: boolean }
> = new Map()

function createWorkspace(id: string) {
  const workspace = new Workspace({ id })
  workspace.register(AffineSchemas)
  workspaceMap.set(id, workspace)

  const provider = createIndexedDBProvider(id, workspace.doc)
  provider.connect()
  providers.set(id, { provider, connected: true })
  return workspace
}

async function switchWorkspace(key: string, workspace: Workspace) {
  const providerInfo = providers.get(key)
  assertExists(providerInfo)

  const { provider, connected } = providerInfo

  if (!connected) provider.connect()

  await provider.whenSynced
  if (workspace.isEmpty) {
    const page = workspace.createPage({
      id: 'page0',
    })

    const pageBlockId = page.addBlock('affine:page', {
      title: new Text(),
    })

    page.addBlock('affine:surface', {}, null)

    // Add frame block inside page block
    const frameId = page.addBlock('affine:frame', {}, pageBlockId)
    // Add paragraph block inside frame block
    page.addBlock('affine:paragraph', {}, frameId)
    page.resetHistory()
  }
  workspaceMap.set(key, workspace)
  return workspace
}

export function getWorkspace(id: string) {
  const workspace = workspaceMap.get(id) || createWorkspace(id)
  return switchWorkspace(id, workspace)
}

export async function createEditor(workspace: Workspace, pageId: string) {
  const { EditorContainer } = await import('@blocksuite/editor')
  const editor = new EditorContainer()
  const provider = providers.get(workspace.id)
  assertExists(provider)
  const page = workspace.getPage(pageId)
  assertExists(page)
  editor.page = page
  return editor
}

export const getEditor = useMemoize(createEditor, {
  getKey(workspace, pageId) {
    return JSON.stringify({ workspaceId: workspace.id, pageId })
  },
})

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
