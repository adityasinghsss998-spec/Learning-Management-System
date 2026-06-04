const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {Userrepository} = require('../repository/auth-repo')
dotenv.config();
class Authservice{
    constructor(){
      this.userrepo=new Userrepository();
    }
    async register(name,email,password,role){
      try{
        const existing = await this.userrepo.findByEmail(email);
        if (existing) throw new Error("Email already registered");
        const user = await this.userrepo.create({name,email,password,role})
      return { id: user._id, name: user.name, email: user.email, role: user.role };
      }catch(e){
        console.log("Something went wrong at the service layer",e);
        throw e;
      }
    }
    async login(email,password){
      try{
        const user = await this.userrepo.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        const match = await user.comparePassword(password);
       if (!match) throw new Error("Invalid credentials");

       const accessToken = user.genAccess();
     const refreshToken = user.genRefresh();
       await this.userrepo.updateRefreshToken(user._id, refreshToken);

       return {
          accessToken,
           refreshToken,
           user: { id: user._id, name: user.name, email: user.email, role: user.role },
      };
      }catch(e){
      console.log("Something went wrong at the service layer",e);
      throw e
    }
    }
    async refresh(token){
      try{
         if(!token) {
          throw new Error ("Token not found hashtag lipgloss!!!...");
         }
         let decoded = jwt.verify(token, process.env.REFRESH_SECRET);
         if(!decoded || user.refreshToken!==token) throw new Error ("token is invalid");
         const user = await this.userrepo.findById(decoded.id);
         if(!user) throw new Error ("Wrong token provided!!");

         const accesstoken=user.genAccess();
         return accesstoken;
      

      }catch(e){
        console.log("SOmehting went wrong at the service layer");
        throw e;
      }
    }
    async logout(id){
      try{
        const response=await this.userrepo.updateRefreshToken(id," ");
        return response;
      }catch(e){
        console.log("Sommehting went wrong at logging out")
      }
    }
}
module.exports={
  Authservice
}