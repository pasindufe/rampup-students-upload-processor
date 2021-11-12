import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import { StudentUploadQueuePayload } from './types/student-upload-queue-payload';
import { Student } from './types/student';
import { Gender } from './types/gender';
import * as fetch from 'node-fetch';
import xlsx from 'node-xlsx';

import {
  STUDENT_UPLOAD_QUEUE_NAME,
  STUDENT_UPLOAD_JOB_NAME,
  File_UPLOAD_FOLDER,
  GRAPHQL_API_URL,
} from './util/constants';
import { HttpStatus, Logger } from '@nestjs/common';
import * as path from 'path';
import { WebSocketClientService } from './web-socket-client.service';

@Processor(STUDENT_UPLOAD_QUEUE_NAME)
export class StudentUploadConsumerService {
  constructor(private wsClientService: WebSocketClientService) {}

  private readonly logger = new Logger(StudentUploadConsumerService.name);

  @Process(STUDENT_UPLOAD_JOB_NAME)
  async processFile(job: Job<StudentUploadQueuePayload>) {
    try {
      const filePath = path.join(
        __dirname,
        `../${File_UPLOAD_FOLDER}`,
        job.data.fileName,
      );
      const records = await this.readExcelFile(filePath);
      if (records && records.length > 0) {
        const result = await this.insertRecords(records);

        if (result) {
          this.logger.log(`job id ${job.id} completed`);
          fs.unlinkSync(filePath);
        }

        //call to web socket
        this.sendMessageToClient(
          true,
          `Job completed. (${records.length}) students added`,
        );
      }
    } catch (ex) {
      //call to web socket
      this.logger.error(ex);
      this.sendMessageToClient(false, 'Job failed');
    }
  }

  async readExcelFile(fileName): Promise<Student[]> {
    const students: Student[] = [];

    try {
      const excelFile = xlsx.parse(fileName);
      await excelFile.map((sheet) => {
        const excelSheetData = sheet.data;
        excelSheetData.shift();
        excelSheetData.forEach((row) => {
          const student: Student = {
            name: row[0],
            gender: row[1]
              ? row[1] === 'MALE'
                ? Gender.MALE
                : Gender.FEMALE
              : null,
            address: row[2] ? row[2].toString() : null,
            mobile: row[3] ? row[3].toString() : null,
            dob: new Date(Math.round((row[4] - (25567 + 1)) * 86400 * 1000)),
          };
          students.push(student);
        });
      });
      this.logger.log(`excel file ${fileName} processed`);
      return students;
    } catch (ex) {
      this.logger.error(ex);
      throw ex;
    }
  }

  async insertRecords(records: Student[]): Promise<boolean> {
    const query = `mutation addStudentList($students: [AddUpdateStudentRequest!]!) {
    addStudentList(students: $students) {
        id
    }
}`;
    return fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { students: records },
      }),
    })
      .then((res) => {
        this.logger.log(`${records.length} student(s) records sent to insert`);
        return res.status == HttpStatus.OK;
      })
      .catch((ex) => {
        this.logger.error(ex);
        return false;
      });
  }

  sendMessageToClient(succeed: boolean, message: string) {
    this.wsClientService.emitMessage({ succeed, message });
  }
}
