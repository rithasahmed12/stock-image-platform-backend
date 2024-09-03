import express, { NextFunction, Request, Response } from 'express';
import Repository from '../repository/repository';
import UseCase from '../../useCase/useCase';
import Controller from '../../adapters/controller';
import EncryptPassword from '../services/bcryptPassword';
import JWTToken from '../services/generateToken';
import S3Uploader from '../services/s3Bucket';
import { upload } from '../middleware/multer';
import authenticateToken from '../middleware/auth';

// Services
const encryptPassword = new EncryptPassword;
const jwtToken = new JWTToken;
const s3Bucket = new S3Uploader

// repositories
const repository = new Repository();

// useCases
const useCase = new UseCase(repository,encryptPassword,jwtToken,s3Bucket);

// Controllers
const controller = new Controller(useCase);

const route = express.Router(); 


route.post('/signup',(req,res,next)=>controller.signUp(req,res,next));
route.post('/login',(req,res,next)=>controller.login(req,res,next));

route.get('/images/:id', authenticateToken, (req: Request, res: Response) => controller.getImages(req, res));
route.post('/upload', authenticateToken, upload.array('images'), (req: Request, res: Response, next: NextFunction) => controller.handle(req, res, next));
route.put('/images/:id', authenticateToken, upload.single('image'), (req: Request, res: Response) => controller.updateImage(req, res));
route.delete('/images/:id', authenticateToken, upload.single('image'), (req: Request, res: Response) => controller.deleteImage(req, res));


export default route;
