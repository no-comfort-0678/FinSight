import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  const initAuth = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("Stored token:", storedToken);
    console.log("Stored user:", storedUser);

    if (!storedToken || !storedUser) {
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/profile", {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });

      console.log("Profile status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        console.log("User restored:", userData);
        setUser(userData);
        setToken(storedToken);
      } else {
        console.log("Token invalid, clearing storage");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }

    setAuthLoading(false);
  };

  initAuth();
}, []);

  const login = ({ user, token }) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
