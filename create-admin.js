// Creates (or updates the password of) the initial NOW4LATERWEB admin account.
// Run with: node scripts/create-admin.js
//
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment so the password
// never has to be typed into a chat, committed to git, or hardcoded.
//
// Example:
//   ADMIN_EMAIL=tariq@now4laterweb.com ADMIN_PASSWORD='choose-a-strong-one' node scripts/create-admin.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running this script."
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: normalizedEmail,
      passwordHash,
      role: "ADMIN",
      name: "Tariq",
    },
  });

  console.log(`Admin account ready: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
