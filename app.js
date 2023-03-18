import express from "express";
import {config} from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js"
import other from "./routes/otherRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
config({
    path:"./config/config.env",
})
const app = express();

//using Middlewares
app.use(express.json());
app.use(express.urlencoded({
   extended:true,
}))

app.use(cookieParser());
//cookie ko pass krne k liye following method is compulsary
//ye cors agar ham na de to is server se ham dusri website pr request hi nhi kar paenge
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))



// const corsOptions = {
//     AccessControlAllowOrigin: '*',
//     origin: 'ttps://adityaclasses.onrender.com',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
//   }
//   app.use(cors(corsOptions))

// Importing & Using Routes

//kisi bhi name se import kr sakte hai kyoki vha pr default export kra tha
import user from "./routes/userRoutes.js";
import course from "./routes/courseRoutes.js";


app.use("/api/v1",course)
app.use("/api/v1",user)
app.use("/api/v1",other)

export default app;

app.get("/",(req,res)=>
res.send(`<h1>Site is Working.Click <a href=${process.env.FRONTEND_URL}> here </a> to visit fronend.</h1>`)
)
// jab jab next ko call krunga aur koi middlre ware bacha nhi hoga to ye ErroMiddleware call ho jaya krega
app.use(ErrorMiddleware)