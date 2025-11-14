import { useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { useTheme } from "./useTheme";
import { Input } from "./ui/input";
import { Card, CardTitle } from "./ui/card";
import "../styles/login.css";
import { Label } from "./ui/label";
import { PasswordInputWithToggle } from "./password-input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import type { User } from "../services/types";

interface AddAccountsAdminProps {
  onClose: () => void;
  onAccountAdded: () => void;
}

export function AddAccountsAdmin({ onClose, onAccountAdded }: AddAccountsAdminProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { theme } = useTheme(); 

  const handleSignup = async () => {
    if (!window.dbAPI) {
      console.error('dbAPI is not available on window object');
      toast.error('Database API not available. Please restart the application.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast.error("❌ Please confirm your password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      toast.error("❌ Password must be at least 6 characters long.");
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Username is required");
      toast.error("❌ Username is required.");
      return;
    }

    console.log('dbAPI found:', window.dbAPI);
    const user: User = {
      uid: `UID-${Date.now()}`,
      username: username.trim(),
      passwordHash: btoa(password),
      isVerified: false,
      temporaryPass: null,
      temporaryPassExpirationDate: null
    };

    try {
      await window.dbAPI.addUser(user);
      toast.success("Account created successfully!");
      
      // Reset form
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setErrorMessage("");
      
      // Notify parent and close
      onAccountAdded();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ThemeProvider>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <Card className="w-full max-w-md border-gray-400 border-1 p-8 bg-background relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>

          <CardTitle className="text-2xl font-bold text-center mb-6">
            Create New Account
          </CardTitle>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="sample.username123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <PasswordInputWithToggle 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                placeholder="Enter your password"
              />
            </div>

            <div className="grid gap-2">
              <PasswordInputWithToggle 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="Confirm Password"
                placeholder="Confirm your password"
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm text-center mt-2">{errorMessage}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSignup} 
                type="button"
                className="flex-1"
              >
                Create Account
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </ThemeProvider>
  );
}