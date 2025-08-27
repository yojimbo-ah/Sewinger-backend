import multer from "multer"
import path from 'path' ;

// handles files upload ( you should use form since you cant send a file a json file so be careful)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)) ;
  }
})

export const upload = multer({ storage: storage });