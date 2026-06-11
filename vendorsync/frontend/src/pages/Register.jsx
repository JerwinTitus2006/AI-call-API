import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, Building2, User, Truck, Store } from "lucide-react";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", org_name: "", role: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!form.org_name.trim()) e.org_name = "Organization name is required";
    if (!form.role) e.role = "Please select a role";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.register(form);
      login(res.data.token, res.data.user);
      toast.success("Welcome to VendorSync! 🔥");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-bg-void flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 w-5/12"
        style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1a0a00 100%)", borderRight: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-3 mb-12">
          <Flame size={28} className="text-fire-core" fill="rgba(255,34,0,0.2)" />
          <span className="font-display text-3xl glow-text">VendorSync</span>
        </div>
        <h2 className="font-display text-5xl leading-tight mb-4 glow-text">
          EVERY MEETING BECOMES INTELLIGENCE
        </h2>
        <p className="text-text-secondary leading-relaxed">
          Record, transcribe, and analyze your distributor-vendor meetings in real time.
          Never lose a pain point or action item again.
        </p>
        <div className="mt-12 space-y-4">
          {["Real-time AI transcription", "Automatic pain point detection", "Action items & follow-ups", "Downloadable reports"].map((f) => (
            <div key={f} className="flex items-center gap-3 text-text-secondary text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-fire-core flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Flame size={22} className="text-fire-core" />
            <span className="font-display text-2xl glow-text">VendorSync</span>
          </div>

          <h1 className="font-display text-4xl mb-2">CREATE ACCOUNT</h1>
          <p className="text-text-secondary text-sm mb-8">Start turning your meetings into intelligence.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Ravi Kumar"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              icon={<User size={14} />}
              error={errors.name}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="ravi@company.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              icon={<Mail size={14} />}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              icon={<Lock size={14} />}
              error={errors.password}
            />
            <Input
              label="Organization Name"
              placeholder="Acme Distributors Pvt Ltd"
              value={form.org_name}
              onChange={(e) => set("org_name", e.target.value)}
              icon={<Building2 size={14} />}
              error={errors.org_name}
            />

            {/* Role selector */}
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "distributor", icon: <Truck size={20} />, label: "Distributor" },
                  { value: "vendor", icon: <Store size={20} />, label: "Vendor" },
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("role", value)}
                    className={`role-card flex-col gap-2 ${form.role === value ? "selected" : ""}`}
                  >
                    <span className={form.role === value ? "text-fire-core" : "text-text-secondary"}>
                      {icon}
                    </span>
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-xs text-fire-core mt-1">{errors.role}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-dim mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-fire-mid hover:text-fire-tip transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
