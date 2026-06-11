import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, BarChart2, Users, Flame } from "lucide-react";
import { PageWrapper } from "../components/Layout/PageWrapper";
import { MeetingCard } from "../components/Meeting/MeetingCard";
import { EmptyState } from "../components/UI/EmptyState";
import { Loader } from "../components/UI/Loader";
import { useAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import { formatDuration } from "../utils/formatTime";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-3">
        <span className="text-text-secondary text-sm">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-number">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await meetingService.list();
      setMeetings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const active = meetings.filter((m) => m.status === "active");
  const upcoming = meetings.filter((m) => m.status === "scheduled");
  const completed = meetings.filter((m) => m.status === "completed");

  const totalHours = Math.round(
    completed.reduce((s, m) => s + (m.duration_seconds || 0), 0) / 3600
  );

  const thisMonth = meetings.filter((m) => {
    const d = new Date(m.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <PageWrapper>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl glow-text">DASHBOARD</h1>
            <p className="text-text-secondary text-sm mt-1">
              Welcome back, {user?.name} · {user?.org_name}
            </p>
          </div>
          <button
            onClick={() => navigate("/meetings/create")}
            className="btn-fire glow-fire"
          >
            <Plus size={18} />
            New Meeting
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Meetings"
            value={meetings.length}
            icon={<Users size={18} />}
            color="#FF2200"
          />
          <StatCard
            label="This Month"
            value={thisMonth}
            icon={<Flame size={18} />}
            color="#FF5500"
          />
          <StatCard
            label="Hours Recorded"
            value={totalHours}
            icon={<Clock size={18} />}
            color="#FF8C00"
          />
          <StatCard
            label="With Reports"
            value={meetings.filter((m) => m.has_analysis).length}
            icon={<BarChart2 size={18} />}
            color="#00FF87"
          />
        </div>

        {loading ? (
          <div className="py-20">
            <Loader text="Loading meetings..." />
          </div>
        ) : (
          <>
            {/* Active / Upcoming */}
            {(active.length > 0 || upcoming.length > 0) && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-fire-core animate-rec-dot" />
                  <h2 className="font-display text-2xl text-text-primary">ACTIVE MEETINGS</h2>
                </div>
                <div className="space-y-3">
                  {active.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                  {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                </div>
              </div>
            )}

            {/* Recent / Completed */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded bg-text-dim" />
                <h2 className="font-display text-2xl text-text-primary">RECENT MEETINGS</h2>
              </div>
              {completed.length === 0 && active.length === 0 && upcoming.length === 0 ? (
                <EmptyState
                  icon="🔥"
                  title="NO MEETINGS YET"
                  description="Create your first meeting to get started with VendorSync."
                  action={
                    <button
                      onClick={() => navigate("/meetings/create")}
                      className="btn-fire"
                    >
                      <Plus size={16} />
                      Create Meeting
                    </button>
                  }
                />
              ) : completed.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="NO COMPLETED MEETINGS"
                  description="Completed meetings will appear here with their AI reports."
                />
              ) : (
                <div className="space-y-3">
                  {completed.slice(0, 10).map((m) => <MeetingCard key={m.id} meeting={m} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/meetings/create")}
        className="fixed bottom-8 right-8 btn-fire rounded-full w-14 h-14 glow-fire text-xl shadow-2xl"
        title="New Meeting"
      >
        <Plus size={22} />
      </button>
    </PageWrapper>
  );
}
