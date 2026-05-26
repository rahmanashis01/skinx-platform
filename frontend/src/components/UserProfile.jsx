import React, { useState } from "react";
import { LogOut } from "lucide-react";

const UserProfile = ({ userName, userEmail, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Get initials from username
  const initials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setShowMenu((p) => !p)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-all active:scale-95"
        title={userName || "User"}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu Card */}
          <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-gray-100 w-56 py-2 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-gray-800 font-semibold text-sm truncate">
                {userName || "User"}
              </p>
              <p className="text-gray-400 text-xs truncate mt-0.5">
                {userEmail || "user@example.com"}
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setShowMenu(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm flex items-center gap-2.5 transition-colors font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
