import express from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateprofilepicture, updateUserRole } from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
const router = express.Router();

//To register a new user
//jab bhi req.file se file ko access krna hai to singleUpload call krna hoga multer k liye
router.route("/register").post(singleUpload,register);

//Login
router.route("/login").post(login);

//Logout
router.route("/logout").get(logout);

//Get my Profile
router.route("/me").get(isAuthenticated,getMyProfile)

//Delete my Profile
router.route("/me").delete(isAuthenticated,deleteMyProfile);

//ChangePassword
router.route("/changepassword").put(isAuthenticated,changePassword);

//updateProfile
router.route("/updateprofile").put(isAuthenticated,updateProfile);

//updateProfilePicture
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateprofilepicture);

//ForgetPassword
router.route("/forgetpassword").post(forgetPassword);

//ResetPassword
router.route("/resetpassword/:token").put(resetPassword);

//AddtoPlaylist
router.route("/addtoplaylist").post(isAuthenticated,addToPlaylist);

//RemoveFromPlaylist
router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlaylist);

//Admin Routes
router.route("/admin/users").get(isAuthenticated,authorizedAdmin,getAllUsers);

//update user role
router.route("/admin/user/:id").put(isAuthenticated,authorizedAdmin,updateUserRole)
.delete(isAuthenticated,authorizedAdmin,deleteUser);
export default router;