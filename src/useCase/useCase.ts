import ImageContainer from "../domain/ImageContainer";
import { IImageData } from "../domain/ImageData";
import User from "../domain/user";
import Repository from "../infrastructure/repository/repository";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import JWTToken from "../infrastructure/services/generateToken";
import S3Uploader from "../infrastructure/services/s3Bucket";
import UseCaseInterface from "./interface/IuseCase";
import { LoginResponse, SignUpResponse } from "./interface/lresponse";


class UseCase implements UseCaseInterface {

   private _Repository:Repository; 
   private _encryptPassword:EncryptPassword;
   private _jwtToken:JWTToken;
   private _s3Bucket:S3Uploader

  constructor(
    Repository:Repository,
    encryptPassword:EncryptPassword,
    jwtToken:JWTToken,
    s3Bucket:S3Uploader,
  ) {
    this._Repository = Repository;
    this._encryptPassword = encryptPassword;
    this._jwtToken = jwtToken;
    this._s3Bucket = s3Bucket;
  }

  async checkExist(email: string,phone:number) {
    const emailExist = await this._Repository.findByEmail(email);
    const phoneExist = await this._Repository.findByNumber(phone);

    if (emailExist || phoneExist) {
      return {
        status: 400,
        data: {
          status: false,
          message: "User already exists",
        },
      };
    } else {
      return {
        status: 200,
        data: {
          status: true,
          message: "User does not exist",
        },
      };
    }
  }

  async signup(body:User): Promise<SignUpResponse> {
    
    const hashedPassword = await this._encryptPassword.encryptPassword(body.password);
    const user = {...body, password:hashedPassword};

    await this._Repository.save(user);

    return {
      status: 200,
      data: {
        status: true,
        message: "Account Created Successfully",
      },
    };
  }

  async verifyUser (body:User): Promise<LoginResponse>{

    const user = await this._Repository.findByEmail(body.email);
    let token= "";

    if(!user){
     return {
      status: 400,
      data: {
        status: false,
        message: "Invalid email or password",
      },
    };
    }

    const passwordMatch = await this._encryptPassword.compare(body.password,user.password);

      if(!passwordMatch){
        return {
          status: 400,
          data: {
            status: false,
            message: "Invalid email or password",
          },
        };
      }
      
    token = this._jwtToken.generateToken(user._id);

    return {
      status: 200,
      data: {
        status: true,
        message: "Login Successfull!",
        payload:{user,token}
      },
    };
  }

  async execute(files: Express.Multer.File[], titles: string[],id:string): Promise<IImageData[]> {
    if (files.length !== titles.length) {
      throw new Error('Number of files and titles do not match');
    }

    const uploadedKeys = await this._s3Bucket.uploadImagesToS3(files);

    console.log('uploadedKeys:', uploadedKeys);
    
    const imageData: IImageData[] = uploadedKeys.map((key, index) => ({
      id:id,
      imageUrl: key,
      title: titles[index]
    }));

    await this._Repository.saveImages(imageData);
    return imageData;
  }

  async getImages(id:string): Promise<ImageContainer[]> {
    const images = await this._Repository.getImages(id);
    // Generate signed URLs for each image
    for (let image of images) {
      image.imageUrl = await this._s3Bucket.getSignedImageUrl(image.imageUrl);
    }
    return images;
  }

  async updateImage(id: string, title: string, newFile?: Express.Multer.File): Promise<IImageData | null> {
    const image = await this._Repository.findImage(id);
    if (!image) return null;
  
    try {
      if (newFile) {
        // Validate new file
        this.validateFile(newFile);
  
        // Delete old file from S3
        await this._s3Bucket.deleteFileFromS3(image.imageUrl);
  
        // Upload new file to S3
        const newFileName = await this._s3Bucket.uploadFile(newFile, newFile.originalname);
        image.imageUrl = newFileName;  // Store the key, not the URL
      }
  
      if (title) {
        image.title = title;
      }
      image.updatedAt = new Date();
  
      // Update the database
      const updatedImage = await this._Repository.updateImage(image);
  
      if (updatedImage) {
        // Generate and attach a signed URL for immediate use
        const signedUrl = await this._s3Bucket.getSignedImageUrl(updatedImage.imageUrl);
        return {
          ...updatedImage,
          imageUrl: signedUrl
        };
      } else {
        return null;
      }
  
    } catch (error) {
      console.error('Error updating image:', error);
      // If there was an error and we uploaded a new file, try to delete it
      if (newFile && image.imageUrl !== newFile.originalname) {
        await this._s3Bucket.deleteFileFromS3(newFile.originalname).catch(console.error);
      }
      throw error;
    }
  }
  
  private validateFile(file: Express.Multer.File) {
    const maxSize = 5 * 1024 * 1024;  // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
    if (file.size > maxSize) {
      throw new Error('File is too large');
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }
  }

  async deleteImage(id: string): Promise<boolean> {
    const image = await this._Repository.findImage(id);
    if (!image) return false;
  
    try {
      // Delete file from S3
      await this._s3Bucket.deleteFileFromS3(image.imageUrl);
  
      // Delete image from database
      const isDeleted = await this._Repository.deleteImage(id);
  
      return isDeleted;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
  
}


export default UseCase;

