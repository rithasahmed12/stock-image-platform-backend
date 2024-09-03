import { Document } from "mongoose";

export default interface ImageContainer extends Document {
    _id?: string;  
    title: string;
    imageUrl: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }