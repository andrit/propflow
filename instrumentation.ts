export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env')
    validateEnv()
    const { registerPdfHandler } = await import('./lib/pdf/handler')
    registerPdfHandler()
  }
}
