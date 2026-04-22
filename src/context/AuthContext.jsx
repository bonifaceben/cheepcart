import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const storedToken = localStorage.getItem("cheepcart_token");
  const storedUser = localStorage.getItem("cheepcart_user");

  const [token, setToken] = useState(storedToken || null);
  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const isAuthenticated = !!token && !!user;

  function login(newToken, userData) {
    localStorage.setItem("cheepcart_token", newToken);
    localStorage.setItem("cheepcart_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("cheepcart_token");
    localStorage.removeItem("cheepcart_user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
