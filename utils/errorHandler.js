class ErrorHandler extends Error{
    constructor(message,statusCode){

        //Error class ka constructor hai super(message)
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorHandler;