const deps = [
  '@nestjs/core', '@nestjs/common', '@nestjs/config', '@nestjs/throttler',
  '@nestjs/jwt', '@nestjs/passport', '@nestjs/terminus', '@nestjs/swagger',
  'helmet', 'compression', 'pino-http', 'class-validator', 'class-transformer',
  'bcryptjs', 'ioredis', 'passport', 'passport-jwt', 'rxjs', 'reflect-metadata',
  '@prisma/client',
];
const t = Date.now();
for (const d of deps) {
  const s = Date.now();
  try {
    require(d);
    console.log(`OK   ${d} (${Date.now() - s}ms)`);
  } catch (e) {
    console.log(`FAIL ${d}: ${e.message}`);
  }
}
console.log('total', Date.now() - t, 'ms');
process.exit(0);