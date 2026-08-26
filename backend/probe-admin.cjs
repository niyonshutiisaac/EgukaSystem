const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

(async () => {
  const u = await p.user.findUnique({ where: { email: 'admin@egukasystem.com' } });
  if (!u) {
    console.log('NOT FOUND');
    process.exit(1);
  }
  console.log('found:', u.email, u.role, 'hash prefix:', u.passwordHash.slice(0, 20));
  console.log('compare ChangeMe123!:', await bcrypt.compare('ChangeMe123!', u.passwordHash));
  console.log('compare Password123:', await bcrypt.compare('Password123', u.passwordHash));
  await p.$disconnect();
})();