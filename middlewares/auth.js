import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../models/User.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  //req.cookies use krne k liye cookie-parser ko import krna padega
  const { token } = req.cookies;
  //401-not authorized
  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  // jwt.verify() ki help se apn token ko verify krenge aur is decode kr denge
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);
  
  //next ko call krne pr next middleware pr pahuch jata hai
  next();
});

export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowwed to acess this resource`,
        403
      )
    );
    next();
};
