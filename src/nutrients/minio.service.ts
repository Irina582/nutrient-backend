import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'media');

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'root'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'rootpassword'),
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Бакет "${this.bucketName}" создан в MinIO`);
      }
    } catch (error) {
      console.error('Ошибка при инициализации бакета MinIO:', (error as Error).message);
    }
  }

  async uploadFile(file: Buffer, originalName: string, mimeType: string): Promise<string> {
    const extension = originalName.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file,
      file.length,
      { 'Content-Type': mimeType },
    );

    return fileName;
  }

  async getSignedUrl(fileName: string | null): Promise<string | null> {
    if (!fileName || fileName === '') return null;

    const expiresIn = 7 * 24 * 60 * 60;
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, fileName, expiresIn);
    } catch (error) {
      console.error('Ошибка при генерации подписанной ссылки:', (error as Error).message);
      return null;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (!fileName || fileName === '') return;
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Ошибка при удалении файла из MinIO:', (error as Error).message);
      throw new InternalServerErrorException('Не удалось удалить файл');
    }
  }
}