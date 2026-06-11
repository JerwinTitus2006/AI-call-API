import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, Send, ArrowRight, LayoutDashboard, Truck, Store } from "lucide-react";
import { PageWrapper } from "../components/Layout/PageWrapper";
import { Input, Textarea } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Modal } from "../components/UI/Modal";
import { meetingService } from "../services/meetingService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function CreateMeeting() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    host_role: user?.role || "distributor",
  });
  const [errors, setErrors] = useState({});
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Meeting title is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        host_role: form.host_role,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      };
      const res = await meetingService.create(payload);
      setCreatedMeeting(res.data);
      toast.success("Meeting created! 🔥");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdMeeting.invite_link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join our VendorSync meeting: ${createdMeeting.invite_link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto animate-slide-up">
        <div className="mb-8">
          <h1 className="font-display text-4xl glow-text">CREATE MEETING</h1>
          <p className="text-text-secondary text-sm mt-1">
            Set up a new distributor-vendor session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-5">
            <Input
              label="Meeting Title *"
              placeholder="Q2 Supply Review — Acme & BrandX"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
            />
            <Textarea
              label="Description (optional)"
              placeholder="Topics: pricing review, delivery timelines, Q3 planning..."
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1.5">
                Scheduled Date & Time (optional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => set("scheduled_at", e.target.value)}
                className="input-fire"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">
                Your Role in this Meeting
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "distributor", icon: <Truck size={18} />, label: "Distributor" },
                  { value: "vendor", icon: <Store size={18} />, label: "Vendor" },
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("host_role", value)}
                    className={`role-card flex items-center gap-3 ${form.host_role === value ? "selected" : ""}`}
                  >
                    <span className={form.host_role === value ? "text-fire-core" : "text-text-secondary"}>
                      {icon}
                    </span>
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Meeting
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        open={!!createdMeeting}
        onClose={() => {}}
        title="🔥 Meeting Created!"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm text-text-secondary mb-1">Meeting Title</p>
            <p className="font-semibold text-text-primary">{createdMeeting?.title}</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-2">Invite Link</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded px-3 py-2 text-xs font-mono truncate"
                style={{ background: "#0a0a0a", border: "1px solid #1F1F1F", color: "#FF5500" }}
              >
                {createdMeeting?.invite_link}
              </div>
              <button
                onClick={copyLink}
                className={`btn-fire px-3 py-2 text-xs flex-shrink-0 ${copied ? "bg-success/20 text-success" : ""}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="space-y-3">
            <button onClick={shareWhatsApp} className="btn-ghost w-full flex items-center justify-center gap-2">
              <Send size={16} />
              Share via WhatsApp
            </button>
            <button
              onClick={() => navigate(`/meeting/${createdMeeting?.id}`)}
              className="btn-fire w-full glow-fire"
            >
              <ArrowRight size={16} />
              Start Meeting Now
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full text-center text-sm text-text-dim hover:text-text-secondary transition-colors py-2"
            >
              <LayoutDashboard size={14} className="inline mr-1" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
