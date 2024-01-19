import { Page, type Workspace } from '@blocksuite/store'
import { assertExists } from '@blocksuite/global/utils'

function waitForRoot(page: Page) {
  if (page.root) {
    return
  }
  return new Promise<void>(((resolve, reject) => {
    const disposable = page.slots.rootAdded.once(() => {
      console.log('resolve')
      resolve();
    });
    window.setTimeout(() => {
      disposable.dispose();
      reject(new NoPageRootError(page));
    }, 20 * 1000);
  }))
}

/**
 * TODO: Define error to unexpected state together in the future.
 */
export class NoPageRootError extends Error {
  constructor(public page: Page) {
    super('Page root not found when render editor!');

    // Log info to let sentry collect more message
    const hasExpectSpace = Array.from(page.rootDoc.spaces.values()).some(
      doc => page.spaceDoc.guid === doc.guid
    );

    console.info(
      'NoPageRootError current data: %s',
      JSON.stringify({
        expectPageId: page.id,
        expectGuid: page.spaceDoc.guid,
        hasExpectSpace,
      })
    );
  }
}

export async function createEditor(
  workspace: Workspace,
  pageId: string
) {
  const { AffineDocEditor } = await import('@blocksuite/presets')
  const editor = new AffineDocEditor()
  const page = workspace.getPage(pageId)
  await page?.load()
  assertExists(page)
  await waitForRoot(page)
  editor.page = page
  return editor
}

export const getEditor = useMemoize(createEditor, {
  getKey(workspace, pageId) {
    return JSON.stringify({ workspaceId: workspace.id, pageId })
  },
})
