import express from 'express';
import Repository from '../repository/repository';
import UseCase from '../../useCase/useCase';
import Controller from '../../adapters/controller';
import EncryptPassword from '../services/bcryptPassword';
import JWTToken from '../services/generateToken';

// Services
const encryptPassword = new EncryptPassword;
const jwtToken = new JWTToken;

// repositories
const repository = new Repository();

// useCases
const useCase = new UseCase(repository,encryptPassword,jwtToken);

// Controllers
const controller = new Controller(useCase);

const route = express.Router(); 


route.post('/signup',(req,res,next)=>controller.signUp(req,res,next));
route.post('/login',(req,res,next)=>controller.login(req,res,next));


export default route;
