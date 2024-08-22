import mongoose, {Model,Schema,Document} from "mongoose";
import User from "../../domain/user"

const userSchema:Schema = new Schema<User|Document>({
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const UserModel:Model<User & Document> = mongoose.model<User & Document>("User",userSchema);

export default UserModel;