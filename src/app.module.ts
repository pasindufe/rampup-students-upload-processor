import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { StudentUploadController } from './student-upload.controller';
import { StudentUploadProducerService } from './student-upload-producer.service';
import { StudentUploadConsumerService } from './student-upload-consumer.service';
import {
  REDIS_DB_HOST,
  REDIS_DB_PORT,
  STUDENT_UPLOAD_QUEUE_NAME,
} from './util/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}\\env\\${process.env.NODE_ENV}.env`,
    }),
    MulterModule.register({ dest: './uploads' }),
    BullModule.forRoot({
      redis: {
        host: REDIS_DB_HOST,
        port: REDIS_DB_PORT,
      },
    }),
    BullModule.registerQueue({
      name: STUDENT_UPLOAD_QUEUE_NAME,
    }),
  ],
  controllers: [StudentUploadController],
  providers: [StudentUploadConsumerService, StudentUploadProducerService],
})
export class AppModule {}
