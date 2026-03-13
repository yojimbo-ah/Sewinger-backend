import cloudinary from "../cloudinary.js";

// this controller handller will work such is receives data about the urls of files that we want to delete 
// in case error happens in the main controller that treats saving data into cloud storage 
// (this function is not type specific , it can delete raw data .pdf .doc ... etc , images such as png or videos)

export const cloudinaryErrorHandler = async (err , req , res , next) => {
    // this is the data that we want to delete from the cloud storage since it saved there
    // but has no realtion with our databse or any other thing so it just takes up space
    // would make the response handeling in the future 
    const uploadedData = req.memorystorage ;

    if (uploadedData.length > 0) {
        const response = uploadedData.map(async(url) => {
            await cloudinary.uploader.destroy(url) ;
        })
        await Promise.all(response) ;
    }

    // handeling the type of error being thrown 

    // this part will get improved in the future 
    // still working on it 
    
    //── Cloudinary Errors ──────────────────────────────────────────────
    if (err.http_code) {
        switch (err.http_code) {
            case 400:
                return res.status(400).json({
                    message: 'Invalid file format or corrupted file',
                    error: err.message
                });
            case 401:
                return res.status(500).json({
                    message: 'Cloudinary authentication failed',
                    error: 'Storage service misconfigured'
                });
            case 403:
                return res.status(403).json({
                    message: 'Upload not allowed',
                    error: err.message
                });
            case 404:
                return res.status(404).json({
                    message: 'Resource not found on storage',
                    error: err.message
                });
            case 420:
                return res.status(429).json({
                    message: 'Too many upload requests, slow down',
                    error: err.message
                });
            case 500:
                return res.status(502).json({
                    message: 'Cloudinary service error',
                    error: 'Storage service temporarily unavailable'
                });
            default:
                return res.status(500).json({
                    message: 'Unexpected storage error',
                    error: err.message
                });
        }
    }

    // file size errors (usually from multer before cloudinary)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: 'File too large',
            error: 'Maximum file size exceeded'
        });
    }

    // ── Mongoose Errors ──────────────────────────────────────────────
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ source: 'database', message: 'Validation failed', details });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ source: 'database', message: `Duplicate value for: ${field}` });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ source: 'database', message: `Invalid value for field: ${err.path}` });
    }

    if (err.name === 'MongoNetworkError') {
        return res.status(503).json({ source: 'database', message: 'Database connection error' });
    }

    // ── Fallback ─────────────────────────────────────────────────────
    return res.status(err.status ?? 500).json({
        source: 'unknown',
        message: err.message ?? 'Internal server error'
    });

}