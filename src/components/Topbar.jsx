import React from "react";
import { useLocation } from "react-router-dom";
import usrImg from "../assets/usr.png";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
const Topbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const location = useLocation();
  const path = location.pathname;
  const title = {
    "/": {
      title: "Shop",
      subtitle: "Shop > Books",
    },

    "/stores": {
      title: "Stores",
      subtitle: "Admin > Stores",
    },
    "/author": {
      title: "Authors",
      subtitle: "Admin > Authors",
    },
    "/books": {
      title: "Books",
      subtitle: "Admin > Books",
    },
    "/store/:storeId": {
      title: "Store Inventory",
      subtitle: "Admin > Store Inventory",
    },
    "/browsebooks": {
      title: "Browse Books",
      subtitle: "Shop > Books",
    },
    "/browseauthors": {
      title: "Browse Authors",
      subtitle: "Shop > Authors",
    },
  };

  return (
    <div className="h-24 border-b border-b-secondary-text flex justify-between items-center">
      <div className="flex flex-col justify-start items-start ">
        <p className="text-lg text-secondary-text">{title[path]?.title}</p>
        <p className="font-light text-secondary-text">
          {title[path]?.subtitle}
        </p>
      </div>
      <div className="flex-1 flex justify-end items-center gap-4">
        {isAuthenticated ? (
          <>
            <img src={usrImg} alt="profile" className="rounded" />
            <p className="text-secondary-text">{user.name}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-main text-white px-4 py-2 rounded"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
