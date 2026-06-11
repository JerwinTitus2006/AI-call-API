import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flame, Truck, Store, Calendar, User, ArrowRight } from "lucide-react";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Loader } from "../components/UI/Loader";
import { meetingService } from "../services/meetingService";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/formatTime";
import toast from "react-hot-toast";

export default function GuestJoin() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [joining, setJoining] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    role: user?.role || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      const res = await meetingService.get(meetingId);
      setMeeting(res.data);
    } catch (err) {
      toast.error("Meeting not found or has ended.");
    } finally {
      setLoadingMeeting(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.role) e.role = "Please select your role";
    return e;
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setJoining(true);

    try {
      await meetingService.join(meetingId, {
        name: form.name,
        role: form.role,
        user_id: user?.id || null,
        is_guest: !isAuthenticated,
      });

      // Store participant info for meeting room
      sessionStorage.setItem(`vs_participant_${meetingId}`, JSON.stringify({
        name: form.name,
        role: form.role,
        is_guest: !isAuthenticated,
      }));

      navigate(`/meeting/${meetingId}`);
    } catch (err) {
      toast.error("Failed to join meeting. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loadingMeeting) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <Loader text="Loading meeting..." />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-fire-core mb-2">MEETING NOT FOUND</p>
          <p className="text-text-secondary mb-6">This meeting may have ended or doesn't exist.</p>
          <button onClick={() => navigate("/")} className="btn-fire">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-void flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <Flame size={24} className="text-fire-core" fill="rgba(255,34,0,0.2)" />
          <span className="font-display text-2xl glow-text">VendorSync</span>
        </div>

        {/* Meeting Info */}
        <div className="card p-6 mb-6">
          <p className="text-xs text-text-dim uppercase tracking-wider mb-1">You're invited to</p>
          <h2 className="font-display text-3xl text-text-primary mb-4">{meeting.title}</h2>
          {meeting.description && (
            <p className="text-sm text-text-secondary mb-4">{meeting.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <User size={12} />
              Hosted by {meeting.host_name}
            </span>
            {meeting.scheduled_at && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDateTime(meeting.scheduled_at)}
              </span>
            )}
          </div>
        </div>

        {/* Join Form */}
        <div className="card p-6">
          <h3 className="font-display text-xl mb-5">ENTER YOUR DETAILS TO JOIN</h3>
          <form onSubmit={handleJoin} className="space-y-5">
            <Input
              label="Your Full Name *"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={isAuthenticated && !!user?.name}
              error={errors.name}
            />

            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">
                Your Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "distributor", icon: <Truck size={18} />, label: "Distributor" },
                  { value: "vendor", icon: <Store size={18} />, label: "Vendor" },
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`role-card flex items-center gap-3 ${form.role === value ? "selected" : ""}`}
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

            <Button type="submit" fullWidth loading={joining} size="lg" icon={<ArrowRight size={16} />}>
              Join Meeting
            </Button>
          </form>

          {!isAuthenticated && (
            <p className="text-center text-xs text-text-dim mt-4">
              Have an account?{" "}
              <button
                onClick={() => navigate(`/login?redirect=/join/${meetingId}`)}
                className="text-fire-mid hover:text-fire-tip transition-colors"
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
