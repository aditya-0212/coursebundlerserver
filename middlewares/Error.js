const ErrorMiddleware = (err,req,res,next) =>{

    err.statusCode = err.statusCode || 500;

    err.mesage = err.message || "internal seerver Error"
     res.status(err.statusCode).json({
         success:true,
         message:err.message
     })
}

export default ErrorMiddleware