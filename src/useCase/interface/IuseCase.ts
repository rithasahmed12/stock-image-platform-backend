import User from "../../domain/user";
import { LoginResponse, SignUpResponse } from "./lresponse";

interface UseCaseInterface {
    checkExist(email:string,phone:number): Promise<{
        status:number;
        data:{
            status:boolean;
            message:string
        }
    }>

    signup(body:User): Promise<SignUpResponse>;

    verifyUser(body:User): Promise<LoginResponse>; 
}

export default UseCaseInterface;