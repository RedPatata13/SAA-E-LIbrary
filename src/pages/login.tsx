import { useState } from "react";
import { ThemeProvider } from "../components/theme-provider";
import { useTheme } from "../components/useTheme";
import { ModeToggle } from "../components/mode-toggle";
import { Input } from "../components/ui/input";
import { Card, CardTitle } from "../components/ui/card";
import "../styles/login.css";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { PasswordInputWithToggle } from "../components/password-input";
import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router-dom";
// import { useSonner } from "sonner";
import { toast } from "sonner";

export default function Login() {
  const { theme } = useTheme();
  // const oppositeTheme = theme === "dark" ? "light" : "dark";
  const navigate = useNavigate();

  // ✅ React state for form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage(""); // clear any previous error

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    try {
      const result = await window.dbAPI.loginUser(username, password);

      if (result.success) {
        console.log("✅ Logged in as:", result.user.username);
        toast("Successfully logged in. ✅");
        navigate("/Library"); // redirect on success
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage("An unexpected error occurred during login.");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div id="main" className="flex justify-center items-center min-h-screen">
      <div className="flex-none fixed top-4 right-4">
        <ThemeProvider>
          <ModeToggle />
        </ThemeProvider>
      </div>

      <Card className="w-96 h-auto border-gray-400 border p-8 space-y-4 gap-4">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>

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

        <div className="grid gap-2">
          {/* <Label htmlFor="password">Password</Label> */}
          <PasswordInputWithToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <Checkbox id="remember" className="w-4 h-4 border" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <p className="text-xs cursor-pointer hover:underline">Forgot Password?</p>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mt-2">{errorMessage}</p>
          )}

          <Button className="mt-4" onClick={handleLogin}>
            Login
          </Button>

          <Button variant={"outline"} onClick={handleSignup}>
            Sign up
          </Button>
        </div>
      </Card>
    </div>
  );
}
