import axios from 'axios';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dn1jdxyoq/upload";
const CLOUDINARY_UPLOAD_PRESET = "Ybgo_driver";


const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.secure_url; 
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

export default uploadImageToCloudinary;
