"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CiUser } from "react-icons/ci";
import { FcGoogle } from "react-icons/fc";
import { RiLockPasswordLine } from "react-icons/ri";
import Cookies from "js-cookie";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/register");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const { userId, role, token } = response.data;

      // Set cookies with proper configuration
      Cookies.set("userId", userId, {
        expires: 1,
        path: "/",
        sameSite: "lax",
      });

      Cookies.set("token", token, {
        expires: 1,
        path: "/",
        sameSite: "lax",
      });

      toast.success("Login successful!");
      router.push("/home");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Login failed");
      } else {
        toast.error("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex justify-center items-center w-full max-w-md mx-auto",
        className
      )}
      {...props}
    >
      <Card className="w-full shadow-lg border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative px-4 text-sm text-gray-500 bg-white">
                OR
              </div>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="w-full h-11 font-medium border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Continue with Google
            </a>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm w-full">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-primary hover:underline"
              onClick={handleRegisterClick}
            >
              Create account
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
