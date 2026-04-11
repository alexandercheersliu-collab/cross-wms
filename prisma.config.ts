import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    async getDatabaseUrl() {
      const url = process.env.DATABASE_URL
      if (!url) {
        throw new Error('DATABASE_URL environment variable is not set')
      }
      return url
    },
  },
  studio: {
    async getDatabaseUrl() {
      const url = process.env.DATABASE_URL
      if (!url) {
        throw new Error('DATABASE_URL environment variable is not set')
      }
      return url
    },
  },
})
