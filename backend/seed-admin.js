const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prisma = new PrismaClient();

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  try {
    const existing = await prisma.user.findMany({ where: { role: 'admin' } });
    if (existing.length > 0) {
      console.log('Admin users already exist. Exiting.');
      process.exit(0);
    }

    console.log('Create initial admin user:');
    const email = await ask('Email: ');
    const name = await ask('Name: ');
    const designation = await ask('Designation: ');
    const department = await ask('Department: ');
    const password = await ask('Password: ');

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: { email, name, designation, department, passwordHash, role: 'admin' },
    });

    console.log(`Admin user created: ${admin.name} (${admin.email})`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
