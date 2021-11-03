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

@Controller('api/students')
export class StudentUploadController {
  constructor(private readonly producerService: StudentUploadProducerService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
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
      await this.producerService.pushToQueue(file.filename);
      const response = {
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
