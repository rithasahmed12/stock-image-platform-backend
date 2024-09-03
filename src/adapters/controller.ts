import { Request, Response, NextFunction } from "express";
import ControllerInterface from "../useCase/interface/Icontroller";
import UseCase from "../useCase/useCase";
import { LoginResponse, SignUpResponse } from "../useCase/interface/lresponse";
import ImageContainer from "../domain/ImageContainer";

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


  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const titles = req.body.titles as string[];
      
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      if (!titles || titles.length !== files.length) {
        res.status(400).json({ error: 'Titles must be provided for each image' });
        return;
      }

      const uploadedImages = await this._useCase.execute(files, titles);
      
      res.status(200).json({ 
        message: 'Images uploaded successfully', 
        images: uploadedImages 
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'An error occurred while uploading images' });
      next();
    }
  }

  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const newFile = req.file as Express.Multer.File | undefined;

      const updatedImage = await this._useCase.updateImage(id, title, newFile);
      if (updatedImage) {
        res.status(200).json(updatedImage);
      } else {
        res.status(404).json({ error: 'Image not found' });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      res.status(500).json({ error: 'An error occurred while updating the image' });
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const images: ImageContainer[] = await this._useCase.getImages();
      res.status(200).json(images);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isDeleted = await this._useCase.deleteImage(id);
      
      if (isDeleted) {
        res.status(200).json({ message: 'Image deleted successfully' });
      } else {
        res.status(404).json({ error: 'Image not found' });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'An error occurred while deleting the image' });
    }
  }

}

export default Controller;
