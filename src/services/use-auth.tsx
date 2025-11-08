import { useContext } from "react";
import { AuthenticationContext } from "./auth-context";

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if(!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};