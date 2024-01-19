import { type Page } from '@blocksuite/store'

export async function initPage(page: Page) {
  await page.load(() => {
    const pageBlockId = page.addBlock('affine:page', {
      title: new page.Text('Untitled'),
    })

    page.addBlock('affine:surface', {}, pageBlockId)

    // Add frame block inside page block
    const noteBlockId = page.addBlock('affine:note', {}, pageBlockId)
    // Add paragraph block inside frame block
    page.addBlock('affine:paragraph', {}, noteBlockId)

  })

  return page
}
