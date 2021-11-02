import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StudentUploadController } from './student-upload.controller';
import { StudentUploadService } from './student-upload.service';

@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [StudentUploadController],
  providers: [StudentUploadService],
})
export class AppModule {}
