import { useEffect, useState, } from "react";
import type { ReactNode } from "react";
import { AuthenticationContext } from "./auth-context";


export interface LayoutContext {
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export interface User {
  uid: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  temporaryPass: string | null;
  temporaryPassExpirationDate: string | null;
}

export interface EBook {
  id: string;
  title: string;
  author?: string;
  size?: number;
  filePath?: string;
  dateAdded: Date;
  base64Data?: string;
  doi?: string;
}

export interface History{
  id: string;
  userId : string,
  bookId : string,
  lastPage : number,
  createdAt: Date
  updatedAt: Date
}
export interface AuthenticationContextType {
  user: User | null;
  login: (username: string, passwordHash: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🔁 Automatically fetch current user when app starts
  useEffect(() => {
    refreshUser();
  }, []);

  /** Refresh user state from DB (via preload) */
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await window.dbAPI.getCurrentUser();
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  /** Logs in user (verifies + persists session in db.json) */
  const login = async (username: string, passwordHash: string) => {
    try {
      const result = await window.dbAPI.loginUser(username, passwordHash);

      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /** Logs out user (clears db.json and resets context) */
  const logout = async () => {
    try {
      await window.dbAPI.logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthenticationContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthenticationContext.Provider>
  );
};