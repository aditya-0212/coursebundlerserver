import multer from "multer";

//to store file in memory
//jse hi reference khatam hoga req.file se to ye delete kr dega apne aap
const storage = multer.memoryStorage();

const singleUpload = multer({storage}).single("file");

export default singleUpload;