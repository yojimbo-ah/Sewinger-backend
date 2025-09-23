
// this function helps extract the images or vids (files) ids saved in cloudinary 
// starting from there secure_url , so it get the cloudinary secure_url as input
// parameter and returns the files public id

const extractPublicId = (cloudinaryUrl) => {
    const parts = cloudinaryUrl.split('/');
    const filename = parts[parts.length - 1]; 
    const publicId = filename.split('.')[0]; 
    return publicId;
};

export default extractPublicId ;