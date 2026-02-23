/**
 * Quick test: can we reach the database?
 * Run: node prisma/test-connection.js
 */
require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["error"],
});

async function main() {
  console.log("Testing database connection...");
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("OK - Connected in", Date.now() - start, "ms");
  } catch (e) {
    console.error("Connection failed:", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
