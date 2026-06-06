const { JsonWebTokenError } = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
 
});
userSchema.methods.comparePassword=async function(pass){
  return await bcrypt.compare(pass,this.password)
}
userSchema.methods.genAccess= function(){
  return jwt.sign(
    {id:this._id, role:this.role,name:this.name,email:this.email},
    process.env.ACCESS_SECRET,
    { expiresIn: "5d" }
  )
}
userSchema.methods.genRefresh = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
module.exports = mongoose.model("User", userSchema);