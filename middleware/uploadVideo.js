import multer from "multer";

// max size 50 MB

const maxSize = 50 * 1024 * 1024 ;

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: maxSize , 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});
