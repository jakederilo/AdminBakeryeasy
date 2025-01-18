import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Define the types for the context values
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, user: { id: string; name: string }) => void;
  logout: () => void;
  token: string | null;
  user: { id: string; name: string } | null;
}

// AuthProvider props type
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to provide authentication context
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<{ id: string; name: string } | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = (newToken: string, newUser: { id: string; name: string }) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    navigate("/");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, token, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
