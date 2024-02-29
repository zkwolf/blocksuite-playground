import { Workspace, Schema, type WorkspaceOptions, type StoreOptions, type BlobStorage, createMemoryStorage, Job, Generator  } from '@blocksuite/store'
import { AffineSchemas, __unstableSchemas } from '@blocksuite/blocks/models'
import { createS3Storage } from './s3'
import { initPage } from './page'
import { IndexedDBDocSource } from '@blocksuite/sync';

export const workspaces = new Map<string, Workspace>()

function getWorkspaceOptions(id: string): WorkspaceOptions {
  const schema = new Schema()
  schema.register(AffineSchemas).register(__unstableSchemas);
  
  const idGenerator: Generator = Generator.NanoID;

  let docSources: StoreOptions['docSources'] = {
    main: new IndexedDBDocSource(),
  };
  let awarenessSources: StoreOptions['awarenessSources'];

  const blobStorages: ((id: string) => BlobStorage)[] = [];

  if (!import.meta.env.VITE_ENDPOINT) {
    blobStorages.push(createMemoryStorage)
  } else {
    blobStorages.push(createS3Storage)
  }

  return {
    id,
    schema,
    idGenerator,
    docSources,
    awarenessSources,
    blobStorages
  }
}

export function createWorkspace(id: string) {
  // get cached workspace, if null create
  let savedWorkspace = workspaces.get(id)
  if (!savedWorkspace) {
    const options = getWorkspaceOptions(id)

    savedWorkspace = new Workspace(options)
    workspaces.set(id, savedWorkspace)
  }

  savedWorkspace.start()
 
  window.workspace = savedWorkspace
  window.job = new Job({ workspace: savedWorkspace })
  return savedWorkspace
}

export async function initWorkspace(id: string) {
  const workspace = createWorkspace(id)

  await workspace.waitForSynced()
  if (Array.from(workspace.pages.keys()).length === 0) {
    const page = workspace.createPage()

    initPage(page)
    page.resetHistory()
  }

  return workspace
}
