import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class StudentUploadProducerService {
  constructor(@InjectQueue('student-upload-queue') private queue: Queue) {}

  async pushToQueue(fileName: string) {
    await this.queue.add('student-upload-job', {
      fileName: fileName,
    });
  }
}
