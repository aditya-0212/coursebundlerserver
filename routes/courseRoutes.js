import express from "express";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLecture } from "../controllers/courseControllers.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// ye root ho to get request pr ye kro

//Get all courses without lectures
router.route("/courses").get(getAllCourses)

//Create new course-only admin
//singleUpload call hone se ab createCourse me req.file se file access kr sakte hai
//singleUpload ko admin protective krna jaruri mai nhi chahta ki koi bhi akar ise access kre 
//jha jha bhi user authenticated rakhna hai vha isAuthenticated ko pass krna jaruri hai
router.route("/createcourse").post(isAuthenticated, authorizedAdmin,singleUpload,createCourse);

//add lecture,delete course,get all course details
//add lecture me bhi authorizedAdmin pass krnenge kyoki lecture add kval admin kr sakta hai
router.route("/course/:id").get(isAuthenticated,getCourseLecture)
.post(isAuthenticated,authorizedAdmin,singleUpload,addLecture)
.delete(isAuthenticated,authorizedAdmin,deleteCourse);

//delete lectures
router.route("/lecture").delete(isAuthenticated,authorizedAdmin,deleteLecture);

export default router;
