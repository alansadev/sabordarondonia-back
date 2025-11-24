import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'sabor-rondonia/products',
          resource_type: 'image',
          transformation: [{ width: 800, crop: 'limit' }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(
              new Error(error.message || 'Erro desconhecido no upload'),
            );
          }

          if (!result) {
            return reject(new Error('Upload concluído mas sem resultado'));
          }

          resolve(result.secure_url);
        },
      );

      if (file && file.buffer) {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } else {
        reject(new Error('Arquivo inválido ou sem buffer'));
      }
    });
  }
}
