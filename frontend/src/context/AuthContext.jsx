import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");

      // If no user is in storage, they are a guest. Just stop loading.
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);

        //  if the data is corrupted and has no token, don't try to decode
        if (!userData || !userData.token) {
          throw new Error("Invalid user data structure");
        }

        const decodedToken = jwtDecode(userData.token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired? Let the Axios Interceptor try to refresh
          const res = await API.get("/api/auth/me");
          const updatedUser = {
            token: userData.token,
            ...res.data.user,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          setUser(userData);
        }
      } catch (error) {
        //  Only call logout if there was ACTUAL corrupted/expired data
        console.error("Authentication initialization failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (data) => {
    const userProfile = {
      token: data.accessToken,
      ...data.user, // This puts 'name', 'role', 'email' at the top level
    };
    localStorage.setItem("user", JSON.stringify(userProfile));
    setUser(userProfile);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
