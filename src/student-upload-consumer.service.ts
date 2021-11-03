import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import { StudentUploadQueuePayload } from './types/student-upload-queue-payload';
import readXlsxFile from 'read-excel-file/node';
import { Student } from './types/student';
import { Gender } from './types/gender';

@Processor('student-upload-queue')
export class StudentUploadConsumerService {
  @Process('student-upload-job')
  async processFile(job: Job<StudentUploadQueuePayload>) {
    const students: Student[] = [];
    try {
      const filePath = `${process.cwd()}\\uploads\\${job.data.fileName}`;

      await readXlsxFile(fs.createReadStream(filePath)).then((rows: any) => {
        // skip header
        rows.shift();
        rows.forEach((row) => {
          const student: Student = {
            name: row[0],
            gender: row[1]
              ? row[1] === 'MALE'
                ? Gender.MALE
                : Gender.FEMALE
              : null,
            address: row[2],
            mobile: row[3],
            dob: row[4],
          };

          students.push(student);
        });
      });
      fs.unlinkSync(filePath);
    } catch (ex) {
      console.log(ex);
    }
    const response = { result: students };
    return response;
  }

  insertRecords = (records: Student[]) => {};
}
