"use client";

import { registerUser } from "@/actions/auth-action";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const username = fd.get("username") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const result = await registerUser(name, username, email, password);
    setLoading(false);

    if (result.created) {
      toast.success("Account created! You can now sign in.");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error.message);
    }
  }

  const inputCls =
    "w-full rounded-lg bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-600 transition";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card text-card-foreground px-7 py-8 shadow-xl">

        {/* Avatar + heading */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold select-none shadow-md mb-3">
            S
          </div>
          <h1 className="text-xl font-bold text-foreground">Create your account</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Join Socially in under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/80">
              Full name <span className="text-muted-foreground">(optional)</span>
            </label>
            <input type="text" name="name" placeholder="Jane Doe" className={inputCls} />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/80">Username</label>
            <input
              type="text" name="username" placeholder="janedoe" required
              pattern="[a-zA-Z0-9_]{3,20}" title="3–20 characters: letters, numbers, underscores"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/80">Email</label>
            <input type="email" name="email" placeholder="you@example.com" required className={inputCls} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-foreground/80">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs text-violet-500 hover:text-violet-400 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password" placeholder="At least 8 characters" required minLength={8}
              className={inputCls}
            />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/80">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirm" placeholder="Re-enter password" required
              className={inputCls}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-violet-500 hover:text-violet-400 transition">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
