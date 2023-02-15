import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto"
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter uour name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  subscription: {
    //ye rozerpay se milegi
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        //course ki id:mogodb k kisi document ki id aegi aur jo bhi id aegi use reference mila hai course ka vha search krega
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // jab ham forgot password pr akr k email dalenge tab ResetPasswordToken generate hoga aur Expiry time save kr lenge taki reset krne me help mile
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

//PreSave - hash password before saving user
//bcrypt = database me apna user save krenge usme jo normal password dalna hoga vo # krk sava krenge
schema.pre("save", async function (next) {
  //agar password change nhi hai to return next kr do update profile k time password k alava sab change krenge tab password modified nhi
  if(!this.isModified("password")) return next()
  //saltOrRounds = jitne jyada rounds honge utni jyada security hogi but rounds jyada hone pr time bhi jyad lenge isliye timing ko bhi dhyan me rakha jana chahiye
  const hashedPassword = await bcrypt.hash(this.password, 10);
  //database me hashpassword save krna
  this.password = hashedPassword;
  next();
});

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
schema.methods.comparePassword = async function (password) {
  console.log(this.password)
  return await bcrypt.compare(password,this.password)
};


schema.methods.getResetToken = function(){

  //randomBytes(20)- 20 random Bytes generate krk dega our toString ki help se isko bataenge ki hex me convert krk do 
const resetToken = crypto.randomBytes(20).toString("hex");

//resetToken hai use algorithm laga kr hash krenge,update()-kisko hash krna hai vo isme pass krna hai,digest("hext")-hext me convert krna hai vo isko bataenge
this.resetPasswordToken  = crypto.createHash("sha256").update(resetToken).digest("hex");

this.resetPasswordExpire  = Date.now() + 15 * 60 * 1000;

return resetToken
}
export const User = mongoose.model("User", schema);
