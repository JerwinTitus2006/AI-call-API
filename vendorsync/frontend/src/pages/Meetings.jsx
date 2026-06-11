import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageWrapper } from "../components/Layout/PageWrapper";
import { MeetingCard } from "../components/Meeting/MeetingCard";
import { EmptyState } from "../components/UI/EmptyState";
import { Loader } from "../components/UI/Loader";
import { meetingService } from "../services/meetingService";
import toast from "react-hot-toast";

export default function Meetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await meetingService.list();
      setMeetings(res.data);
    } catch (e) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const filtered = meetings.filter((m) => {
    const matchesQuery = !query || m.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || m.status === filter;
    return matchesQuery && matchesFilter;
  });

  const STATUS_FILTERS = ["all", "active", "scheduled", "completed", "cancelled"];

  return (
    <PageWrapper>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl glow-text">MEETINGS</h1>
            <p className="text-text-secondary text-sm mt-1">All your distributor-vendor sessions</p>
          </div>
          <button onClick={() => navigate("/meetings/create")} className="btn-fire glow-fire">
            <Plus size={18} />
            New Meeting
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings..."
              className="input-fire pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase transition-all ${
                  filter === s
                    ? "bg-fire-core text-white"
                    : "bg-bg-dark border border-bg-border text-text-secondary hover:border-fire-mid"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20"><Loader text="Loading meetings..." /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="NO MEETINGS FOUND"
            description={query ? `No meetings matching "${query}"` : "Create your first meeting to get started."}
            action={
              !query && (
                <button onClick={() => navigate("/meetings/create")} className="btn-fire">
                  <Plus size={16} />
                  Create Meeting
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
