import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AdminLoginProps {
  onAuthSuccess?: () => void;
}

export default function AdminLogin({ onAuthSuccess }: AdminLoginProps) {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  const form = useForm<any>({
    resolver: zodResolver(mode === 'register' ? registerSchema : loginSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");

    try {
      const endpoint = mode === 'login' ? '/api/admin/login' : '/api/admin/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const result = await response.json();

      if (mode === 'login') {
        localStorage.setItem('adminToken', result.token);
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          setLocation('/admin');
        }
      } else {
        setMode('login');
        setError("Registration successful! Please log in.");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.getValues('email')) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.getValues('email') }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setError("Password reset link sent to your email!");
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Admin Login' : mode === 'register' ? 'Admin Registration' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Access the admin dashboard' : mode === 'register' ? 'Create a new admin account' : 'Enter your email to reset password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className={`mb-4 ${error.includes('successful') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <AlertDescription className={error.includes('successful') ? 'text-green-700' : 'text-red-700'}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="First name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode !== 'forgot' && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type={mode === 'forgot' ? 'button' : 'submit'}
                className="w-full"
                disabled={isLoading}
                onClick={mode === 'forgot' ? handleForgotPassword : undefined}
              >
                {isLoading ? 'Processing...' : 
                  mode === 'login' ? 'Sign In' : 
                  mode === 'register' ? 'Create Account' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-2">
            {mode === 'login' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('register')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin Account
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('forgot')}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Forgot Password?
                </Button>
              </>
            )}

            {mode !== 'login' && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setMode('login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}