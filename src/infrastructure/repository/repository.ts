import User from "../../domain/user";
import UserModel from "../database/userModel";
import Repo from "../../useCase/interface/Irepo";

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

  async findByNumber(phone: number): Promise<User | null> {
     const userData = await UserModel.findOne({phone:phone});
     return userData;
  }
  
}

export default Repository;