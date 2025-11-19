import React from "react";
import Searchbar from "./Searchbar";
import { useAuth } from "../contexts/AuthProvider";

const Header = ({ addNew, title, buttonTitle }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 ">
        <h1 className="text-lg ">{title || "Authors List"}</h1>
        <Searchbar />
      </div>
      {isAuthenticated && (
        <button
          className="bg-main text-white rounded px-4 py-2"
          onClick={() => {
            addNew();
          }}
        >
          {buttonTitle || `Add New ${title.split(" ")[0]}`}
        </button>
      )}
    </div>
  );
};

export default Header;
