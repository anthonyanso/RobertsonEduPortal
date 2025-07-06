import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

interface AuthLayoutProps {
  onAuthSuccess: () => void;
}

export default function AuthLayout({ onAuthSuccess }: AuthLayoutProps) {
  const [currentView, setCurrentView] = useState<"signin" | "signup">("signin");

  const handleAuthSuccess = () => {
    // Store authentication state
    localStorage.setItem("isAdminAuthenticated", "true");
    onAuthSuccess();
  };

  const switchToSignUp = () => setCurrentView("signup");
  const switchToSignIn = () => setCurrentView("signin");

  if (currentView === "signin") {
    return (
      <SignIn
        onSuccess={handleAuthSuccess}
        onSwitchToSignUp={switchToSignUp}
      />
    );
  }

  return (
    <SignUp
      onSuccess={handleAuthSuccess}
      onSwitchToSignIn={switchToSignIn}
    />
  );
}