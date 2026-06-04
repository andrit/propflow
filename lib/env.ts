const REQUIRED_ENV = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_MONTHLY_PRICE_ID',
  'STRIPE_PRO_ANNUAL_PRICE_ID',
  'STRIPE_TEAMS_MONTHLY_PRICE_ID',
  'STRIPE_TEAMS_ANNUAL_PRICE_ID',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'DATABASE_URL',
  'NEXT_PUBLIC_APP_URL',
] as const

export function validateEnv(): void {
  const missing = REQUIRED_ENV.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
      missing.map(k => `  • ${k}`).join('\n') +
      `\n\nCopy .env.local.example to .env.local and fill in the values.`
    )
  }
}
