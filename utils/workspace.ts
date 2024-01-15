import {
  type IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace, Schema } from '@blocksuite/store'
import { AffineSchemas, __unstableSchemas } from '@blocksuite/blocks/models'
import { nanoid } from 'nanoid'
import { IndexedDBProviderWrapper } from './indexeddb-provider'

export const workspaces = new Map<string, Workspace>()
export const providers: Map<string, IndexedDBProvider> = new Map()

export function createProvider(
  id: string,
  { connect = true }: { connect?: boolean } = {}
) {
  const workspace = createWorkspace(id)
  if (providers.has(id)) return providers.get(id)!

  const provider = createIndexedDBProvider(workspace.doc, 'PLAYGROUND_DB')
  if (connect) provider.connect()
  providers.set(id, provider)
  return provider
}

export function createWorkspace(id: string) {
  if (workspaces.has(id)) return workspaces.get(id)!

  const schema = new Schema()
  schema.register(AffineSchemas).register(__unstableSchemas);

  const workspace = new Workspace({ id, schema, providerCreators: [
    (_id, doc) => new IndexedDBProviderWrapper(doc)
  ] })
  workspaces.set(id, workspace)
  return workspace
}

async function syncProviders(
  workspace: Workspace
) {
  const providers = workspace.providers;

  for (const provider of providers) {
    if ('active' in provider) {
      provider.sync();
      await provider.whenReady;
    } else if ('passive' in provider) {
      provider.connect();
    }
  }
}

export async function initWorkspace(id: string) {
  const workspace = createWorkspace(id)

  await syncProviders(workspace)
  await workspace.doc.whenSynced
  if (Array.from(workspace.pages.keys()).length === 0) {
    const id = nanoid()
    const page = workspace.createPage({
      id,
    })

    await page.load(() => {
      const pageBlockId = page.addBlock('affine:page', {
        title: new page.Text('Untitled'),
      })

      page.addBlock('affine:surface', {}, pageBlockId)

      // Add note block inside page block
      const noteBlockId = page.addBlock('affine:note', {}, pageBlockId)
      // Add paragraph block inside frame block
      page.addBlock('affine:paragraph', {}, noteBlockId)
    })
    page.resetHistory()
  }

  return workspace
}
