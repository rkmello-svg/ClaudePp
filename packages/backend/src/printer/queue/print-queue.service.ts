import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import Redis from 'redis';
import { v4 as uuid } from 'uuid';
import { PrintJob } from '@claudepp/shared';

@Injectable()
export class PrintQueueService {
  private readonly logger = new Logger(PrintQueueService.name);
  private printQueue: Queue;
  private redisClient: Redis.Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.printQueue = new Queue('print-jobs', {
      connection: this.redisClient as any,
    });

    this.setupWorker();
  }

  async addPrintJob(storeId: string, type: 'receipt' | 'report' | 'label', content: string): Promise<PrintJob> {
    const jobId = uuid();
    const job: PrintJob = {
      id: jobId,
      storeId,
      type,
      content,
      status: 'pending',
      createdAt: new Date(),
    };

    await this.printQueue.add('print', job, { jobId });
    this.logger.log(`Print job added: ${jobId}`);
    return job;
  }

  async getJobStatus(jobId: string): Promise<PrintJob['status']> {
    const job = await this.printQueue.getJob(jobId);
    if (!job) return 'failed';
    return job.progress() as any;
  }

  private setupWorker(): void {
    new Worker('print-jobs', async (job) => {
      this.logger.log(`Processing print job: ${job.id}`);
      // TODO: Implement actual printing logic
      return { success: true };
    }, {
      connection: this.redisClient as any,
    });
  }
}
