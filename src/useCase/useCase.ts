import User from "../domain/user";
import Repository from "../infrastructure/repository/repository";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import JWTToken from "../infrastructure/services/generateToken";
import UseCaseInterface from "./interface/IuseCase";
import { LoginResponse, SignUpResponse } from "./interface/lresponse";

class UseCase implements UseCaseInterface {

   private _Repository:Repository; 
   private _encryptPassword:EncryptPassword;
   private _jwtToken:JWTToken;

  constructor(
    Repository:Repository,
    encryptPassword:EncryptPassword,
    jwtToken:JWTToken
  ) {
    this._Repository = Repository;
    this._encryptPassword = encryptPassword;
    this._jwtToken = jwtToken;
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
        message: "Account Created Successfully",
        payload:{user,token}
      },
    };
  }
}


export default UseCase;

