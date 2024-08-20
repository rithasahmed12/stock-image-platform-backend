import dotenv from "dotenv";
dotenv.config();
import express from 'express';

import http from 'http';
import route from "../router/routes";

const app = express();

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended:true}));


export const httpServer = http.createServer(app);

app.use("/api",route);


