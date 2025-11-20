import React from "react";
import PropTypes from "prop-types";

export default function LogoutButton({renableLogin}) {
  const handleLogout = async () => {
    renableLogin(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
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

  return <button onClick={handleLogout}>Logout</button>;
}


LogoutButton.propTypes = {
  renableLogin: PropTypes.func.isRequired,
};
