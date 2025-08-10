import { useUser, useAuth } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added this import
import axios from "axios";
import { toast } from "react-hot-toast";
import { assets } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const { user, isLoaded: userLoaded } = useUser(); // ✅ Get loading state
  const { getToken } = useAuth();
  const navigate = useNavigate(); // Added this line

  const [isOwner, setIsOwner] = useState(null); // ✅ Start with null instead of false
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);
  const [userDataLoaded, setUserDataLoaded] = useState(false); // ✅ Track if user data is loaded

  const facilityIcons = {
    "Free WiFi": assets.freeWifiIcon,
    "Free Breakfast": assets.freeBreakfastIcon,
    "Room Service": assets.roomServiceIcon,
    "Mountain View": assets.mountainIcon,
    "Pool Access": assets.poolIcon,
  };

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await getToken(); // ✅ Use getToken() instead of sessionId
      const res = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched user data:", res.data);
      // Handle the fetched user data here if needed
      setUserDataLoaded(true);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setUserDataLoaded(true); // Still mark as loaded even if failed
    }
  };

  useEffect(() => {
    // ✅ Wait for Clerk to load and determine user state
    if (!userLoaded) return;

    if (!user) {
      // User is not authenticated
      setIsOwner(false);
      setUserDataLoaded(true);
      return;
    }

    const role = user?.publicMetadata?.role;
    console.log("User role:", role);

    if (role === "hotelOwner") {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }

    // Fetch additional user data
    fetchUser();
  }, [user, userLoaded]);

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currency,
        user,
        getToken,
        navigate, // Added this line
        isOwner,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        facilityIcons,
        rooms,
        setRooms,
        searchedCities,
        setSearchedCities,
        userLoaded, // ✅ Expose loading state
        userDataLoaded, // ✅ Expose user data loading state
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
