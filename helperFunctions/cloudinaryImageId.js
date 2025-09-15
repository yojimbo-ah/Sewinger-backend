

const extractPublicId = (cloudinaryUrl) => {
    const parts = cloudinaryUrl.split('/');
    const filename = parts[parts.length - 1]; 
    const publicId = filename.split('.')[0]; 
    return publicId;
};

export default extractPublicId ;