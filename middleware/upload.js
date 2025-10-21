import multer, { memoryStorage } from "multer"
import path from 'path' ;

// handles files upload ( you should use form since you cant send a file a json file so be careful)
// max size for image is 6 MB

const maxSize = 6 * 1024 * 1024 ;

export const upload = multer({ storage: multer.memoryStorage() ,
  limits : {
    fieldSize : maxSize
  } ,
  fileFilter : (req , file , cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb (null , true) 
    } else {
      cb (new Error('cant handle this type of files') , false) ;
    }
  }
 });