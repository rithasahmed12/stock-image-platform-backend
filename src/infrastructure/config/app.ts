import dotenv from "dotenv";
dotenv.config();
import express from 'express';

import cors from 'cors';

import http from 'http';
import route from "../router/routes";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended:true}));



export const httpServer = http.createServer(app);

app.use("/api",route);


