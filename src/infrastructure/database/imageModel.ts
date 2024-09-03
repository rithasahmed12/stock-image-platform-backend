import mongoose, {Model,Schema,Document} from "mongoose";
import ImageContainer from "../../domain/ImageContainer";

const ImageContainerSchema = new Schema<ImageContainer>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ImageContainerModel: Model< ImageContainer> = mongoose.model< ImageContainer>('ImageContainer', ImageContainerSchema);

export default ImageContainerModel;