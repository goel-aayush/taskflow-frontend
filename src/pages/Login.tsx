import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { authService } from "../services/authService";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useUserStore((state) => state.login);
  const showNotification = useUIStore((state) => state.showNotification);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });
      // Save auth and continue; app initialization will hydrate the rest.
      loginStore(response.user, response.token);

      showNotification(
        `Welcome back, ${response.user?.name || "user"}`,
        "success",
      );
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-[2rem] mb-6">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-on-background tracking-tight">
            Welcome Back
          </h1>
          <p className="text-secondary font-medium mt-2">
            Sign in to manage your projects
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/20 p-4 rounded-2xl flex items-center gap-3 text-error text-sm font-bold animate-in bounce-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-outline-variant p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <label className="flex items-center gap-2 cursor-pointer text-secondary">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
              />
              <span>Remember me</span>
            </label>
            <Link to="#" className="text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 font-black" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-secondary">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
