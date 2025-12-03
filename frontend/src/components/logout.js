import React from "react";
import PropTypes from "prop-types";

export default function LogoutButton({emailLoggedIn, renableLogin}) {
  const handleLogout = async () => {
    renableLogin(true);
    try {
      const response = await fetch("https://tigertix-user-auth.up.railway.app/api/auth/logout", {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

      console.log("Logged out");

      // Try removing cookie manually (works only if not HttpOnly)
      document.cookie = "token=; Max-Age=0; Path=/;";

    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <p>{emailLoggedIn}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}


LogoutButton.propTypes = {
  emailLoggedIn: PropTypes.string.isRequired,
  renableLogin: PropTypes.func.isRequired,
};
