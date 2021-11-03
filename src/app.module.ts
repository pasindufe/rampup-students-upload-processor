import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StudentUploadController } from './student-upload.controller';
import { StudentUploadProducerService } from './student-upload-producer.service';
import { StudentUploadConsumerService } from './student-upload-consumer.service';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 5379,
      },
    }),
    BullModule.registerQueue({
      name: 'student-upload-queue',
    }),
  ],
  controllers: [StudentUploadController],
  providers: [StudentUploadConsumerService, StudentUploadProducerService],
})
export class AppModule {}
