const mongoose= require("mongoose");
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        unique:[true,"username already exist"]
    },
    email:{
        type:String,
        unique:[true,"use another email address"],
        required:true
    },
    password:{
        type:String,
        requires:true
    }
})
const userModel=mongoose.model("users",userSchema)
module.exports=userModel