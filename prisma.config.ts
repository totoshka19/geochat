import { defineConfig, env } from 'prisma/config'

type Env = {
  DATABASE_URL: string
  DIRECT_DATABASE_URL: string
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Прямое соединение для CLI-операций (db push, migrate, studio)
    url: env<Env>('DIRECT_DATABASE_URL'),
  },
})
