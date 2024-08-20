import express from 'express';
import Repository from '../repository/repository';

const route = express.Router();

const repository = new Repository();

export default route;