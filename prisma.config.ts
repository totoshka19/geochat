import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DIRECT_DATABASE_URL — для локального CLI (db push, seed)
    // DATABASE_URL — fallback для Vercel build (prisma generate не нуждается в реальном подключении)
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
  },
})
