import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import {Course} from "../models/Course.js"
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js"
import {Stats} from "../models/Stats.js"

//this is for register
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;
 
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter all filed", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  //Upload file on cloudinary;
 

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);


  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id:mycloud.public_id,
      url:mycloud.secure_url,
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

//login function start from here
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("email", email, "password", password);


  if (!email || !password)
    return next(new ErrorHandler("Please enter all filed", 400));
  //jab user define kr rhe the tab password ko false diya tha ki password ko ese select nhi kr sakte hai
  let user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Passwrld", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));

  sendToken(res, user, `Welcome back, ${user.name} `, 201);
});

//this is for the logout
//cookies empty krenge
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Loged out successfully",
    });
});

//get my profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  //agar login user hai to user ki sari property mil jaegi (req.user._id) ki help se
  //jse bhi koi bhi login hoga to id mannualy mil jaegi
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

//this is for the changePassword
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter all field", 400));

  //select password hoga tab hi compare password me this.password access ho paega
  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect old password", 400));

  user.password = newPassword;
  await user.save();

  
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

//this is for the update profile
export const updateProfile= catchAsyncError(async (req, res, next) => {
    const { name,email } = req.body;
    //isme sabhi fill krna mendatory nhi hai isiliye isme ! operator ka use nhi kra hai
    //select password hoga tab hi compare password me this.password access ho paega
    const user = await User.findById(req.user._id);
  
   if(name) user.name = name;
   if(email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message:"Profile Updated Successfully",
    });
  });
  

  //update profile pictures
export const updateprofilepicture = catchAsyncError(async(req,res,next)=>{

  const file = req.file;
  
  const user = await User.findById(req.user._id);
    
  const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  
    //new profilepicture upload krne se phle cloudinary pr padi huhi profilepicture ko delete krna hoga
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //new profile jo cloudinary pr upload hui use avatar me as a object pass krenge
    user.avatar = {
      public_id:mycloud.public_id,
      url:mycloud.secure_url,
    }

      res.status(200).json({
          success:true,
          message:"Profile Picture Updated Successfully",
      })
  })

  //forgetpassword
  export const forgetPassword = catchAsyncError(async(req,res,next)=>{
const { email } = req.body;

const user = await User.findOne({email});

if(!user) return next(new ErrorHandler("user not found",400));

const resetToken = await user.getResetToken();

await user.save();

//http://localhost:3000/resetpassword/adkjjfajsfjsidf
const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

const message = `Click on the link to reset your password. ${url}.If you have not request then please ignore`;

//send token via eamil
await sendEmail(user.email,"CourseBundler Reset Password",message);

 //Cloudinary:TODO
      res.status(200).json({
          success:true,
          message:`Reset Token has been sent to ${user.email}`,
      })
  })

  //resetpassword
  export const resetPassword = catchAsyncError(async(req,res,next)=>{
  const {token} = req.params;

  const resetPasswordToken = crypto.createHash("sha256")
  .update(token)
  .digest("hex");

  const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{
          $gt:Date.now(),
      },
  })

  if(!user)
      return next(new ErrorHandler("Token is invalid or has been expired"));
 
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    //Cloudinary:TODO
      res.status(200).json({
          success:true,
          message:"Password Change Successfully",
        })
  })

  //add to playlist
  export const addToPlaylist = catchAsyncError(async(req,res,next)=>{
      const user = await User.findById(req.user._id);

      const course = await Course.findById(req.body.id);

      if(!course) return next(new ErrorHandler("Invalid Course id",404));

//jo course apn de rhe hai agar uski id phle se playlist k array me present ho to true de denge
      const itemExist = user.playlist.find((item)=>{
          if(item.course.toString() === course._id.toString()) return true;
      })
     if(itemExist) return next(new ErrorHandler("Item Already Exist",409))
      user.playlist.push({
          course:course._id,
          poster:course.poster.url,
      })

      await user.save();

      res.status(200).json({
        success:true,
        message:"Added to playlist",
       
    })
  })

  //remove From Playlist
  export const removeFromPlaylist = catchAsyncError(async(req,res,next)=>{const user = await User.findById(req.user._id);

    const course = await Course.findById(req.query.id);

    if(!course) return next(new ErrorHandler("Invalid Course id",404));

    //isme jo bhi course delete krna hai usk id k barabar jiski bhi id nhi hai vo sab return honge
   const newPlaylist = user.playlist.filter((item)=>{
       if(item.course.toString() != course._id.toString())
       return item;
   });
    user.playlist = newPlaylist;
    await user.save();

    res.status(200).json({
      success:true,
      message:"Remove from playlist",
     
  })
})

//Admin Controllers
export const getAllUsers = catchAsyncError(async(req,res,next)=>{

  const users = await User.find({});

  res.status(200).json({
    success:true,
    users,
   
})
})

//update User Role
export const updateUserRole = catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.params.id);

  if(!user) return next(new ErrorHandler("User not found"),404)

  if(user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();
  res.status(200).json({
    success:true,
    message:"Role Updated",
   
})
})

//Delete User
export const deleteUser = catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.params.id);

  if(!user) return next(new ErrorHandler("User not found"),404)

  //cloudinary se picture ko delte krenge 
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //Cancel Subscription

  //aur database se user ko remove krenge
  await user.remove();
  res.status(200).json({
    success:true,
    message:"User Deleted Successfully",
   
})
})

//Delete myprofile
export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.user._id);

  //cloudinary se picture ko delte krenge 
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //Cancel Subscription
   
  //aur database se user ko remove krenge
  await user.remove();

  //sath me cookies ko bhi empty kr denge
  res.status(200).cookie("token",null,{
    expires:new Date(Date.now()),
  }).json({
    success:true,
    message:"User Deleted Successfully",
   
})
})


//real time data check krega ki jse hi vo update ho function call kr dega
//jse hi koi new user create ho hame update krna padega
//limit(1) ka mean hota hai sabse last wala
User.watch().on("change", async() => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

// const subscription = await User.find({ "subscription.status": "active" });
stats[0].users = await User.countDocuments();
// stats[0].subscription = subscription.length;
stats[0].createdAt = new Date(Date.now());

await stats[0].save();
  
});