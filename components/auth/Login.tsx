"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Signed in successfully!");
      window.location.href = "/";
    }

    setLoading(false);
  }

  const inputCls =
    "w-full rounded-lg bg-[#242424] px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-violet-600 transition";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161616] px-7 py-8 shadow-xl">

        {/* Avatar + heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold select-none shadow-md mb-3">
            S
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Sign in to your Socially account.</p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-[#242424] py-2.5 text-sm font-medium text-white hover:bg-[#2a2a2a] disabled:opacity-60 transition mb-5"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-neutral-500">or sign in with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-300">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-300">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs text-violet-400 hover:text-violet-300 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              required
              className={inputCls}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-1 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-5 text-center text-xs text-neutral-400">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.311 0-9.818-3.386-11.42-8.093l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C42.012 35.245 44 30 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
