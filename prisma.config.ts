import { config } from "dotenv"
config({ path: ".env.local" })
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct (non-pooled) connection for migrations
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
})
