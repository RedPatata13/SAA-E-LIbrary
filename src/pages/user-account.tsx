import React, { useState } from "react";
import { useAuth } from "../services/use-auth";
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
import { useParams } from "react-router-dom";

const UserAccount: React.FC = () => {
  const { user } = useAuth();
  const { uid } = useParams<{ uid: string }>();
  const [username, setUsername] = useState(user?.username || "");

  if (!user) {
    return <p>Loading user data...</p>;
  }

  const handleSaveUsername = () => {
    // TODO: implement saving username
    console.log("Save username:", username);
  };

  const handleCopyUID = () => {
    navigator.clipboard.writeText(user.uid);
    console.log("Copied UID:", user.uid);
  };

  const handleChangePassword = () => {
    // TODO: implement password change flow
    console.log("Change password clicked");
  };

  const handleDeactivateAccount = () => {
    // TODO: implement account deactivation flow
    console.log("Deactivate account clicked");
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
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
              />
              <Button onClick={handleSaveUsername}>Save</Button>
            </div>
          </div>

          <Separator />

          {/* Password */}
          <div>
            <Label>Password</Label>
            <Button
              variant="outline"
              onClick={handleChangePassword}
              className="mt-1"
            >
              Change Password
            </Button>
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
          {user.isVerified && (
            <>
              <Separator />
              <div>
                <Label>Account Status</Label>
                <Button
                  variant="destructive"
                  onClick={handleDeactivateAccount}
                  className="mt-1"
                >
                  Deactivate Account
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccount;
