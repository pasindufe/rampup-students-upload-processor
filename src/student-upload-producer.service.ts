import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import * as fs from 'fs';

import {
  STUDENT_UPLOAD_QUEUE_NAME,
  STUDENT_UPLOAD_JOB_NAME,
  File_UPLOAD_FOLDER,
} from './util/constants';
import * as path from 'path';

@Injectable()
export class StudentUploadProducerService {
  constructor(@InjectQueue(STUDENT_UPLOAD_QUEUE_NAME) private queue: Queue) {}

  async pushToQueue(fileName: string): Promise<boolean> {
    try {
      const job = await this.queue.add(STUDENT_UPLOAD_JOB_NAME, {
        fileName: fileName,
      });
      if (job.finished()) return true;
    } catch (ex) {
      const filePath = path.join(
        __dirname,
        `../${File_UPLOAD_FOLDER}`,
        fileName,
      );
      fs.unlinkSync(filePath);
      console.log(ex);
      return false;
    }
  }
}
