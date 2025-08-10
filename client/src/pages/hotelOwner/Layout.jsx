import React, { useEffect } from "react";
import Navbar from "../../components/hotelOwner/Navbar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Layout = () => {
  const { isOwner, user, userLoaded } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Layout - User:", user);
    console.log("Layout - IsOwner:", isOwner);
    console.log("Layout - UserLoaded:", userLoaded);

    // Only check authentication after Clerk has loaded
    if (userLoaded) {
      if (!user) {
        // No user logged in
        navigate("/");
        return;
      }

      if (isOwner === false) {
        // User is logged in but not an owner
        console.log("Redirecting because user is not owner");
        navigate("/");
        return;
      }
    }
  }, [isOwner, user, userLoaded, navigate]);

  // Show loading while authentication state is being determined
  if (!userLoaded || isOwner === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated or not an owner, don't render anything
  // (useEffect will handle the redirect)
  if (!user || isOwner === false) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 p-4 pt-10 md:px-10 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
