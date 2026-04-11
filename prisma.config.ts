import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    getDatabaseUrl: async () => {
      const url = process.env.DATABASE_URL
      if (!url) {
        throw new Error('DATABASE_URL environment variable is not set')
      }
      return url
    },
  },
})
