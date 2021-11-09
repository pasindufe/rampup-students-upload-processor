import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { StudentUploadProducerService } from './student-upload-producer.service';
import { File_UPLOAD_FOLDER } from './util/constants';

@Controller('api/students')
export class StudentUploadController {
  constructor(private readonly producerService: StudentUploadProducerService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `./${File_UPLOAD_FOLDER}`,
        filename: (req, file, callback) => {
          callback(null, generateFilename(file));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xls|xlsx)$/)) {
          callback(new Error('Only xls/xlsx files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file) {
    try {
      const result = await this.producerService.pushToQueue(file.filename);
      const response = {
        completed: result,
        filename: file.filename,
      };
      return response;
    } catch (ex) {
      console.log(ex);
    }
  }
}

const generateFilename = (file) => {
  return `${Date.now()}${extname(file.originalname)}`;
};
