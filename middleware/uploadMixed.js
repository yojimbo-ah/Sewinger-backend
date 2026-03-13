// this is the middleware for uploading folders 
// contating pictures and pdfs documents spesifically
// needed in the seller request creating route so we 
// can handle the folder being uploaded 

import multer from "multer" ;

const MAX_SIZE = 50 * 1024 * 1024 // 50MB per file
// these are the allowed types of files the user can sent 
const ALLOWED_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',                                                // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
]



export const uploadMixed = multer({
    // multer.memorystorage() means dont create the files
    // in the secondary drive ( hdd , sdd , nvme sdd) keep it 
    // in ram so we can handle it by either accepting it 
    // or either not accepting it
    storage : multer.memoryStorage() ,
    fileFilter : (req , file , cb)=> {
        if(ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null , true)
        } else {
            cb(new Error(`${file.mimetype} is not a allowed type`) , false)
        }
    }  ,
    limits : {
        files : 10 ,
        fileSize : MAX_SIZE
    }
})