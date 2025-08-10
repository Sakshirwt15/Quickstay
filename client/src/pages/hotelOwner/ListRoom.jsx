import React, { useEffect } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const { axios, getToken, user, currency } = useAppContext();
  const [rooms, setRooms] = React.useState([]);

  // Fetch Rooms of the Hotel Owner
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle Availability of the Room
  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post(
        "/api/rooms/toggle-availability",
        { roomId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch Rooms when user is logged in
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users."
      />

      {/* All Rooms Section Header */}
      <div className="mt-8 mb-4">
        <h3 className="text-lg font-medium text-gray-700">All Rooms</h3>
      </div>

      {/* Table Container */}
      <div className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium text-left">
                Name
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-left max-sm:hidden">
                Facility
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-left">
                Price / night
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms.length > 0 ? (
              rooms.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200">
                    {item.roomType}
                  </td>
                  <td className="py-3 px-4 text-gray-500 border-t border-gray-200 max-sm:hidden">
                    {item.amenities && item.amenities.length > 0
                      ? item.amenities.join(", ")
                      : "No amenities listed"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200">
                    {currency}
                    {item.pricePerNight}
                  </td>
                  <td className="py-3 px-4 border-t border-gray-200 text-center">
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        onChange={() => toggleAvailability(item._id)}
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.isAvailable}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                  No rooms found. Add your first room!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Room Count */}
      {rooms.length > 0 && (
        <p className="text-gray-500 mt-4 text-sm">
          Total Rooms: {rooms.length}
        </p>
      )}
    </div>
  );
};

export default ListRoom;
