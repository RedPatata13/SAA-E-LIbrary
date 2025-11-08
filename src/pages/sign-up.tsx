import { ThemeProvider } from "../components/theme-provider";
import { useTheme } from "../components/useTheme";
import { ModeToggle } from "../components/mode-toggle";
import { Input } from "../components/ui/input";
import { Card, CardTitle } from "../components/ui/card";
import "../styles/login.css";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { PasswordInputWithToggle } from "../components/password-input";
import { useState } from "react"; // Import useState
// import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import type { User } from "../services/types";
// import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";

export default function Signup() {
  const { theme } = useTheme();
  // const oppositeTheme = theme === "dark" ? "light" : "dark";
  const navigate = useNavigate();

  // State to store input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const handleLogin = async() => {
    navigate('/');
  }
  const handleSignup = async () => {
    if (!window.dbAPI) {
      console.error('dbAPI is not available on window object');
      alert('Database API not available. Please restart the application.');
      return;
    }

    if(password !== confirmPassword){
      console.error('Please confirm password');
      toast("❌ Please confirm your password. ");
      return;
    }

  console.log('dbAPI found:', window.dbAPI);
  const user: User = {
    uid: `UID-${Date.now()}`, // Generate a more unique ID
    username: username, // Use the username from state
    passwordHash: btoa(password), // Use the password from state
    isVerified: false, // Typically false for new signups
    temporaryPass: null,
    temporaryPassExpirationDate: null
  };
  // alert("Success");
  await window.dbAPI.addUser(user);
  
  // Optional: Clear form after submission
  setUsername("");
  setPassword("");
  setconfirmPassword("");
  // setError
  
  // Optional: Navigate to login or other page
  // Toaster("Sign up succesful! Redirecting to Login...");
  toast("Sign up successful! Redirecting to Login...");
  navigate("/");
  };

  return (
    <ThemeProvider>
      <div id="main" className="flex justify-center items-center">
        <div className="flex-none fixed top-4 right-4">
          <ModeToggle />
        </div>

        <Card className="w-100 h-auto border-gray-400 border-1 p-8">
          <CardTitle className="text-2xl font-bold text-center">Sign up</CardTitle>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="sample.username123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-3">
            <PasswordInputWithToggle 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="Enter your password"
            />
            <PasswordInputWithToggle 
              value={confirmPassword}
              onChange={(e) => setconfirmPassword(e.target.value)}
              label=" Confirm Password"
              placeholder="Confirm your password"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm text-center mt-2">{errorMessage}</p>
            )}
            <br />
            <Button onClick={handleSignup} type="button">
              Sign up
            </Button>
            <Button variant="outline" type="button" onClick={handleLogin}>
              Back to Log in
            </Button>
          </div>
        </Card>
      </div>
    </ThemeProvider>
  );
}