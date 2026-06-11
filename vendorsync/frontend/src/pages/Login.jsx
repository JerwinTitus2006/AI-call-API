import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Mail, Lock } from "lucide-react";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 🔥`);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-bg-void flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 w-5/12"
        style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1a0a00 100%)", borderRight: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-3 mb-12">
          <Flame size={28} className="text-fire-core" fill="rgba(255,34,0,0.2)" />
          <span className="font-display text-3xl glow-text">VendorSync</span>
        </div>
        <h2 className="font-display text-5xl leading-tight mb-4 glow-text">
          YOUR MEETINGS, TRANSFORMED
        </h2>
        <p className="text-text-secondary leading-relaxed">
          Sign in to access your meeting intelligence dashboard. Your transcripts, analyses, and reports are waiting.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Flame size={22} className="text-fire-core" />
            <span className="font-display text-2xl glow-text">VendorSync</span>
          </div>

          <h1 className="font-display text-4xl mb-2">WELCOME BACK</h1>
          <p className="text-text-secondary text-sm mb-8">Sign in to continue your sessions.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              icon={<Mail size={14} />}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              icon={<Lock size={14} />}
              error={errors.password}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast("Contact your admin to reset your password.", { icon: "ℹ️" })}
                className="text-xs text-text-dim hover:text-fire-mid transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-dim mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-fire-mid hover:text-fire-tip transition-colors">
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
