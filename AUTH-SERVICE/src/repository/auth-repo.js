const User=require('../models/user');
class Userrepository{
   async create(data){
      try{
         const user=await User.create(data);
         return user;
      }catch(e){
        console.log("something went wrong at the repo layer",e)
        throw e;
      }
   }
   async findByEmail(email){
      try{
         const response=await User.findOne({email});
         return response;
      }catch(e){
        console.log("something went wrong at the repo layer",e);
        throw e;
      }
   }
   async findById(id){
    try{
         const response=await User.findById(id);
         return response;
      }catch(e){
        console.log("something went wrong at the repo layer",e);
        throw e;
      }
   }
   async updateRefreshToken(id,token){
    try{
         const response=await User.findByIdAndUpdate(id,{refreshToken:token});
      }catch(e){
        console.log("something went wrong at the repo layer",e);
        throw e;
      }
   }
}
module.exports={
   Userrepository
}