import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{type: String, required: true, trim: true},
    email:{type: String, required: true, trim: true},
    password:{type: String, required: true, trim: true},
    confirmPassword:{type: String, required: true, trim: true},
    tc: {type:Boolean, required: true}
})

const  userModel = new mongoose.model("user", UserSchema);

export default userModel;