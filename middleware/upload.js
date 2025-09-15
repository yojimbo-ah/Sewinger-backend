import multer, { memoryStorage } from "multer"
import path from 'path' ;

// handles files upload ( you should use form since you cant send a file a json file so be careful)


export const upload = multer({ storage: multer.memoryStorage() ,
  limits : {
    fieldSize : 6 * 1024 * 1024
  } ,
  fileFilter : (req , file , cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb (null , true) 
    } else {
      cb (new Error('cant handle this type of files') , false) ;
    }
  }
 });