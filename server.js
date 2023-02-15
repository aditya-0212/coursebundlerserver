import app from "./app.js";
import {connectDB} from "./config/database.js"
import cloudinary from "cloudinary";
import Razarpay from "razorpay"
import nodeCron from "node-cron"
import { Stats } from "./models/Stats.js"
connectDB();

//isme tino value cloudinary ki website se milegi
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET,
})

//NodeCron = set a schedule to create new State each month
//schedule(sec,min,hr,day,month,year)
//24*7 sal k har din ye function run hota rhega
nodeCron.schedule("0 0 0 1 * *",async ()=>{
    try{
        await Stats.create({});
    }catch(error){
        console.log(error);
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`Server is working on port:${process.env.PORT}`);
})