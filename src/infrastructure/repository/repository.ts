import User from "../../domain/user";
import UserModel from "../database/userModel";
import Repo from "../../useCase/interface/Irepo";
import ImageContainerModel from "../database/imageModel";
import { IImageData } from "../../domain/ImageData";
import ImageContainer from "../../domain/ImageContainer";

class Repository implements Repo {

 async save(user:User): Promise<User>{
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return savedUser;
 }

 async findByEmail(email: string): Promise<User | null> {
    const userData = await UserModel.findOne({ email: email });
    return userData;
  }

 async findImage(id: string): Promise<ImageContainer | null> {
    const userData = await ImageContainerModel.findById(id);
    return userData;
  }

  async findByNumber(phone: number): Promise<User | null> {
     const userData = await UserModel.findOne({phone:phone});
     return userData;
  }

  async getImages(id:string): Promise<ImageContainer[]> {
   return await ImageContainerModel.find({id:id}).sort({ updatedAt:-1});
 }
  
  async saveImages(imageData: IImageData[]): Promise<void> {
   await ImageContainerModel.insertMany(imageData);
 }

 async updateImage(image:ImageContainer): Promise<ImageContainer | null> {
   await image.save();
   return image;
 }

 async deleteImage(id: string): Promise<boolean> {
   const result = await ImageContainerModel.findByIdAndDelete(id);
   return result !== null;
 }
}

export default Repository;