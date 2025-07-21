import AdminLogin from "./AdminLogin";

interface AuthLayoutProps {
  onAuthSuccess: () => void;
}

export default function AuthLayout({ onAuthSuccess }: AuthLayoutProps) {
  return <AdminLogin onAuthSuccess={onAuthSuccess} />;
}