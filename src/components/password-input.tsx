import { useState } from 'react';
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react"; 
import { Label } from './ui/label';

interface PasswordInputWithToggleProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
}

export function PasswordInputWithToggle({ 
  value = "", 
  onChange, 
  label = "Password", 
  placeholder = "Enter your password" 
}: PasswordInputWithToggleProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3 flex items-center justify-center aspect-square"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}