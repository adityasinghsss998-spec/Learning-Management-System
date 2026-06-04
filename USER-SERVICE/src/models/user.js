const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        userId: { 
           type: String,
           required: true, 
           unique: true 
          },
        name: { 
           type: String,
           required: true
           },
        email: { 
           type: String,
           required: true, 
           unique: true
           },
        role: {
             type: String, 
             enum: ["student", "instructor"], 
            default: "student" 
          },
        bio: { 
          type: String, 
          default: "" 
        },
        avatar: { 
          type: String, 
          default: "" 
        },
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            twitter: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

userSchema.methods.toPublicProfile = function () {
    return {
        userId: this.userId,
        name: this.name,
        email: this.email,
        role: this.role,
        bio: this.bio,
        avatar: this.avatar,
        socialLinks: this.socialLinks,
    };
};

module.exports = mongoose.model("User", userSchema);