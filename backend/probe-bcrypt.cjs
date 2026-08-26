const bcrypt = require('bcryptjs');
console.log('bcryptjs exports keys:', Object.keys(bcrypt).slice(0, 8).join(', '));
(async () => {
  const h = await bcrypt.hash('ChangeMe123!', 12);
  console.log('fresh hash:', h.slice(0, 25));
  console.log('fresh compare:', await bcrypt.compare('ChangeMe123!', h));
  const stored = '$2b$12$BddXReWQ1F.AO';
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  const u = await p.user.findUnique({ where: { email: 'admin@egukasystem.com' } });
  console.log('re-compare with full stored hash:', await bcrypt.compare('ChangeMe123!', u.passwordHash));
  await p.$disconnect();
})();