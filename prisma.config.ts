import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    async getDatabaseUrl() {
      return process.env.DATABASE_URL!
    },
  },
})
