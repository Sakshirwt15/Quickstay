import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (add this to ensure it's always configured)
cloudinary.config({
  cloud_name: "dt2jxsjcp",
  api_key: "418125984874561", 
  api_secret: "3_nBUTjS2F27RsfBl6wQBEluqRg",
  secure: true
});
// API to create a new room for a hotel
// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    // ✅ DEBUG: Check environment variables
    console.log("=== CLOUDINARY DEBUG ===");
    console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
    console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***SET***" : "NOT SET");
    console.log("Files received:", req.files?.length || 0);
    
    const { roomType, pricePerNight, amenities } = req.body;

    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) return res.json({ success: false, message: "No Hotel found" });

    // ✅ DEBUG: Check if files exist before upload
    if (!req.files || req.files.length === 0) {
      console.log("No files received - skipping image upload");
      // Create room without images for testing
      await Room.create({
        hotel: hotel._id,
        roomType,
        pricePerNight: +pricePerNight,
        amenities: JSON.parse(amenities),
        images: [], // Empty array for now
      });
      return res.json({ success: true, message: "Room created successfully (no images)" });
    }

    // ✅ Test cloudinary configuration before upload
    try {
      console.log("Testing Cloudinary config...");
      const pingResult = await cloudinary.api.ping();
      console.log("Cloudinary connection successful!", pingResult);
    } catch (configError) {
      console.error("Cloudinary config error:", configError);
      return res.json({ success: false, message: "Cloudinary configuration error: " + configError.message });
    }

    // upload images to cloudinary
    console.log("Starting image uploads...");
    const uploadImages = req.files.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}:`, file.originalname);
      try {
        const response = await cloudinary.uploader.upload(file.path, {
          folder: "hotel_rooms", // Optional: organize uploads in folders
          resource_type: "image"
        });
        console.log(`Upload ${index + 1} successful:`, response.secure_url);
        return response.secure_url;
      } catch (uploadError) {
        console.error(`Upload ${index + 1} failed:`, uploadError);
        throw uploadError;
      }
    });

    // Wait for all uploads to complete
    const images = await Promise.all(uploadImages);
    console.log("All uploads completed. Total images:", images.length);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error("CreateRoom Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms
// GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner',
          select: 'image',
        },
      }).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms for a specific hotel
// GET /api/rooms/owner
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to toggle availability of a room
// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({ success: true, message: "Room availability Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};