import React, { useState } from "react";
import { useAuth } from "../services/use-auth";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

interface AccountPageProps {
  isAdmin?: boolean;
}

const AccountPage: React.FC<AccountPageProps> = ({ isAdmin = false }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // Add this
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Add this

  if (!user) {
    return <p>Loading user data...</p>;
  }

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.dbAPI.updateUsername(user.uid, username);

      if (result.success) {
        await refreshUser();
        toast.success("Username updated successfully");
      } else {
        toast.error(result.message || "Failed to update username");
      }
    } catch (error) {
      toast.error("Failed to update username");
      console.error("Error updating username:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUID = () => {
    navigator.clipboard.writeText(user.uid);
    toast("UID copied to clipboard");
  };

  const handleChangePassword = async () => {
    if (!showPasswordFields) {
      setShowPasswordFields(true);
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.dbAPI.changePassword(user.uid, newPassword);

      if (result.success) {
        toast.success("Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordFields(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        throw new Error(result.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
      console.error("Error changing password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await window.dbAPI.deactivateAccount(user.uid);

      if (result.success) {
        toast.success("Account deactivated successfully");
        await window.dbAPI.logoutUser();
        navigate("/");
      } else {
        throw new Error(result.message || "Failed to deactivate account");
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
      console.error("Error deactivating account:", error);
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div style={{ height: '100vh', overflowY: 'auto' }}>
    <div className="flex min-h-full items-start justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* UID */}
            <div className="flex items-center justify-between">
              <div>
                <Label>UID</Label>
                <p className="text-gray-500 break-all">{user.uid}</p>
              </div>
              <Button variant="outline" onClick={handleCopyUID}>
                Copy UID
              </Button>
            </div>

            <Separator />

            {/* Username */}
            <div>
              <Label>Username</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                <Button onClick={handleSaveUsername} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Password */}
            <div>
              <Label>Password</Label>
              {!showPasswordFields ? (
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  className="mt-1"
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-3 mt-2">
                  {/* New Password with Eye Icon */}
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password with Eye Icon */}
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordFields(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Verification */}
            <div>
              <Label>Verified</Label>
              <p>{user.isVerified ? "Yes" : "No"}</p>
            </div>

            {/* Temporary Password */}
            {user.temporaryPass && (
              <div>
                <Label>Temporary Password</Label>
                <p>{user.temporaryPass}</p>
                <p className="text-gray-500 text-sm">
                  Expires: {user.temporaryPassExpirationDate}
                </p>
              </div>
            )}

            {/* Deactivate Account */}
            {(user.isVerified || isAdmin) && (
              <>
                <Separator />
                <div>
                  <Label>Account Status</Label>
                  <Button
                    variant="destructive"
                    onClick={handleDeactivateAccount}
                    className="mt-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Deactivating..." : "Deactivate Account"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
       </div>
      </div>
    </div>
  );
};

export default AccountPage;