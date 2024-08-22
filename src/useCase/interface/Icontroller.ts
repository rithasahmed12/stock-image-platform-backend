import { NextFunction, Request, Response } from "express";
import { LoginResponse, SignUpResponse } from "./lresponse";


interface ControllerInterface {
    signUp(req: Request, res: Response, next: NextFunction): Promise<Response<SignUpResponse>>;
    login(req:Request, res:Response, next:NextFunction): Promise<Response<LoginResponse>>
  }


export default ControllerInterface; 
