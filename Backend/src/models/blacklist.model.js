 const mongoose=require('mongoose')

 const blacklistTokenSchema= new mongoose.Schema({
    tokenHash:{
        type:String,
        index:true
    },
    expiresAt:{
        type:Date,
        expires:0
    },
    // Keep checking legacy tokens while existing sessions expire.
    token:String
 })
 const tokenBlacklistModel= mongoose.model("blacklistTokens",blacklistTokenSchema)
 module.exports=tokenBlacklistModel;
