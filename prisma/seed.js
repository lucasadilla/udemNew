require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.create({
    data: { email, passwordHash },
  });
  console.log("Admin created:", email, "(password: " + password + ")");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
