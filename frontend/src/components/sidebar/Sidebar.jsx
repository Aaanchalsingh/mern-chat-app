import React, { useState } from "react";
import axios from "axios";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

const Sidebar = () => {
  const [status, setStatus] = useState("online");

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put("/api/users/status", { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="border-r border-slate-500 p-4 flex flex-col">
      <SearchInput />
      <div className="divider px-3"></div>
      <Conversations />
      <div className="mb-5">
        <p>Set Status</p>
        {/* Button for online status */}
        <button
          className={`status-button ${
            status === "online" && "active"
          } bg-gray-500
		  hover:bg-gray-800
		  text-white font-bold py
		  -1 px-3 rounded
		  shadow`}
          onClick={() => handleStatusChange("online")}
        >
          Online
        </button>
        {/* Button for busy status */}
        <button
          className={`status-button ${
            status === "busy" && "active"
          }bg-green-500
		  hover:bg-green-800
		  text-white font-bold py
		  -1 px-3 rounded
		  shadow mt-2`}
          onClick={() => handleStatusChange("busy")}
        >
          Busy
        </button>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
