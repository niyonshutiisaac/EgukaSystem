import 'reflect-metadata';
console.log('step 1: importing');
const { NestFactory } = require('@nestjs/core');
console.log('step 2: nest factory loaded');
const { AppModule } = require('./dist/app.module');
console.log('step 3: app module loaded');
const t = Date.now();
NestFactory.create(AppModule, { bufferLogs: true })
  .then(() => console.log('step 4: created in', Date.now() - t, 'ms'))
  .catch((e) => console.log('step 5: FAILED', e.message))
  .finally(() => setTimeout(() => process.exit(0), 1000));
setTimeout(() => console.log('still pending at 20s'), 20000);