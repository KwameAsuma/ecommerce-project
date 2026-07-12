const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npm run create-admin <email> <password>");
    process.exit(1);
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: "System Admin",
        role: "ADMIN",
        trustScore: 100
      }
    });

    console.log(`\n✅ Successfully created admin account!`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role:  ${newAdmin.role}\n`);
    console.log(`You can now log in at the main login page to access the Admin Hub.`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
