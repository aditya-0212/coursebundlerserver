import mongoose from "mongoose";
mongoose.set('strictQuery', false);
export const connectDB = async()=>{
    //connect function me mongo db ki uri pass krni hai
    const {connection}  = await mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true});

    console.log(`MongoDB connected with ${connection.host}`);
}