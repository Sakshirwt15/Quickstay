import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  try {
    // Debug environment variables
    console.log("Cloudinary Environment Check:");
    console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
    console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    // Test the connection
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connected successfully:", result);
  } catch (error) {
    console.error("Cloudinary connection failed:", error);
  }
};

export default connectCloudinary;