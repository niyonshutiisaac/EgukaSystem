/**
 * Worker process bootstrap — scales independently from the API.
 * Currently a placeholder: BullMQ jobs (notifications, report precompute,
 * scheduled AI insights) plug in here. Runs the same NestJS container
 * in "worker mode" (no HTTP server).
 */
import 'reflect-metadata';
import { Logger } from '@nestjs/common';

const logger = new Logger('Worker');

async function run(): Promise<void> {
  logger.log('Worker process started (job processors will attach here)');
  logger.log('Waiting for jobs...');
  // Keep the process alive; queue processors are registered by future job modules.
  setInterval(
    () => {
      // heartbeat
    },
    1000 * 60 * 5,
  );
}

void run();
