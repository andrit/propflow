import { eventBus } from '@/lib/domain/events'
import { generatePdf } from './generator'

export function registerPdfHandler(): void {
  eventBus.subscribe('pdf.render.requested', async (event) => {
    const { proposalId, userId } = event.payload as { proposalId: string; userId: string }
    try {
      await generatePdf(proposalId, userId)
    } catch (err) {
      console.error('[pdf] generation failed for proposal', proposalId, err)
    }
  })
}
