/**
 * Create or reset the default admin (admin@example.com / admin123).
 * Run: npm run db:reset-admin
 */
require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_EMAIL = "admin@example.com";
const DEFAULT_PASSWORD = "admin123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const admin = await prisma.admin.upsert({
    where: { email: DEFAULT_EMAIL },
    update: { passwordHash },
    create: {
      email: DEFAULT_EMAIL,
      passwordHash,
    },
  });
  console.log("Default admin ready:");
  console.log("  Email:", DEFAULT_EMAIL);
  console.log("  Password:", DEFAULT_PASSWORD);
  console.log("  (id:", admin.id + ")");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
