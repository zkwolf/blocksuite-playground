import {
  type IndexedDBProvider,
  createIndexedDBProvider,
} from '@toeverything/y-indexeddb'
import { Workspace, Schema, type WorkspaceOptions, type DocProviderCreator, type BlobStorage, createMemoryStorage } from '@blocksuite/store'
import { AffineSchemas, __unstableSchemas } from '@blocksuite/blocks/models'
import { nanoid } from 'nanoid'
import { IndexedDBProviderWrapper } from './indexeddb-provider'
import { createS3Storage } from './s3'
import { initPage } from './page'

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

function getWorkspaceOptions(id: string): WorkspaceOptions {
  const schema = new Schema()
  schema.register(AffineSchemas).register(__unstableSchemas);

  const providerCreators: DocProviderCreator[] = []
  providerCreators.push((_id, doc) => new IndexedDBProviderWrapper(doc))

  const blobStorages: ((id: string) => BlobStorage)[] = [];

  if (!import.meta.env.VITE_ENDPOINT) {
    blobStorages.push(createMemoryStorage)
  } else {
    blobStorages.push(createS3Storage)
  }

  return {
    id,
    schema,
    providerCreators,
    blobStorages
  }
}

export function createWorkspace(id: string) {
  const options = getWorkspaceOptions(id)  

  const workspace = new Workspace(options)
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

    await initPage(page)
    page.resetHistory()
  }

  return workspace
}
