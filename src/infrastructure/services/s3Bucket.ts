import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand,S3ServiceException  } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import crypto from 'crypto';
import * as path from 'path';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export default class S3Uploader {
  private bucketName: string;
  private bucketRegion: string;
  private s3AccessKey: string;
  private s3SecretAccessKey: string;
  private s3Client: S3Client;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME as string;
    this.bucketRegion = process.env.S3_BUCKET_REGION as string;
    this.s3AccessKey = process.env.S3_ACCESS_KEY as string;
    this.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.s3AccessKey,
        secretAccessKey: this.s3SecretAccessKey,
      },
      region: this.bucketRegion,
    });
  }

  private generateRandomImageName = (bytes = 32): string => {
    return crypto.randomBytes(bytes).toString('hex');
  }

  public uploadImagesToS3 = async (files: IFile[]): Promise<string[]> => {
    const uploadedImageKeys: string[] = [];

    for (const file of files) {
      const stream = Readable.from(file.buffer);
      const imageName = this.generateRandomImageName();
      const uploader = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: imageName,
          Body: stream,
          ContentType: file.mimetype,
        },
      });

      try {
        await uploader.done();
        console.log(`${file.originalname} uploaded successfully`);
        uploadedImageKeys.push(imageName);
      } catch (error) {
        console.error(`Error uploading ${file.originalname} to S3:`, error);
      }
    }

    return uploadedImageKeys;
  }

  public getSignedImageUrl = async (imageKey: string|undefined, expiresIn: number = 3600): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: imageKey,
    });
    
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private generateRandomFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const randomName = crypto.randomBytes(32).toString('hex');
    return `${randomName}${ext}`;
  }

  public uploadFile = async (file: any, fileName: string): Promise<string> => {
    let buffer: Buffer;
    if (file.buffer instanceof ArrayBuffer) {
      buffer = Buffer.from(file.buffer);
    } else if (Buffer.isBuffer(file.buffer)) {
      buffer = file.buffer;
    } else {
      throw new Error('Invalid buffer type');
    }
  
    const stream = Readable.from(buffer);
    const randomFileName = this.generateRandomFileName(fileName);
    const uploader = new Upload({
      client: this.s3Client,
      params: { 
        Bucket: this.bucketName,
        Key: randomFileName,
        Body: stream,
        ContentType: file.mimetype,
      },
    });
  
    try {
      await uploader.done();
      console.log(`${fileName} uploaded successfully as ${randomFileName}`);
      return randomFileName;
    } catch (error) {
      console.error(`Error uploading ${fileName} to S3:`, error);
      throw error;
    }
  }

  public retrieveFile = async (fileKey: string, expiresIn: number = 3600): Promise<string> => {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const command = new GetObjectCommand(getObjectParams);
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error(`Error generating signed URL for file ${fileKey}:`, error);
      throw error;
    }
  }

  public fileExistsInS3 = async (fileKey: string): Promise<boolean> => {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof S3ServiceException) {
        if (error.name === 'NotFound') {
          return false;
        }
      }
      console.error('Error checking if file exists in S3:', error);
      throw error;
    }
  }

  public deleteFileFromS3 = async (fileKey: string): Promise<void> => {
    try {
      console.log(`Attempting to delete file: ${fileKey}`);

      if (!fileKey) {
        throw new Error("Invalid file key");
      }

      if (await this.fileExistsInS3(fileKey)) {
        const deleteParams = {
          Bucket: this.bucketName,
          Key: fileKey,
        };
        console.log(`Delete params:`, deleteParams);

        const command = new DeleteObjectCommand(deleteParams);
        await this.s3Client.send(command);
        console.log(`${fileKey} deleted successfully from S3`);
      } else {
        console.log(`File ${fileKey} does not exist in S3`);
      }
    } catch (error) {
      console.error(`Error deleting file from S3:`, error);
      throw error;
    }
  }
}