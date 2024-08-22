import { Request, Response, NextFunction } from "express";
import ControllerInterface from "../useCase/interface/Icontroller";
import UseCase from "../useCase/useCase";
import { LoginResponse, SignUpResponse } from "../useCase/interface/lresponse";

class Controller implements ControllerInterface {
  private _useCase: UseCase;

  constructor(useCase: UseCase) {
    this._useCase = useCase;
  }

  async signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<SignUpResponse>> {
    try {
      const verifyUser = await this._useCase.checkExist(req.body.email,req.body.phone);

      if (verifyUser.data.status === true) {
        const signup = await this._useCase.signup(req.body);
        return res.status(signup.status).json(signup);
      } else {
        return res.status(verifyUser.status).json(verifyUser);
      }
    } catch (error) {
      next(error);
      return res
        .status(500)
        .json({
          status: 500,
          data: { status: false, message: "Internal server error" },
        });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response<LoginResponse>> {
    try{
      const verifyUser = await this._useCase.verifyUser(req.body);

      if(verifyUser.data?.status === true){
        return res.status(verifyUser.status).json(verifyUser)
      }else{
        return res.status(verifyUser.status).json(verifyUser)
      }

    }catch(error){
      next(error);
      return res
        .status(500)
        .json({
          status: 500,
          data: { status: false, message: "Internal server error" },
        });
    }
  }
}

export default Controller;
