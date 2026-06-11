import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, FileText, Calendar } from "lucide-react";
import { PageWrapper } from "../components/Layout/PageWrapper";
import { Loader } from "../components/UI/Loader";
import { EmptyState } from "../components/UI/EmptyState";
import { Badge } from "../components/UI/Badge";
import { meetingService } from "../services/meetingService";
import { formatDateTime, formatDuration } from "../utils/formatTime";

export default function Reports() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meetingService.list().then((res) => {
      setMeetings(res.data.filter((m) => m.status === "completed"));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="font-display text-4xl glow-text">REPORTS</h1>
          <p className="text-text-secondary text-sm mt-1">AI intelligence reports for completed meetings</p>
        </div>

        {loading ? (
          <div className="py-20"><Loader text="Loading reports..." /></div>
        ) : meetings.length === 0 ? (
          <EmptyState
            icon="📊"
            title="NO REPORTS YET"
            description="Complete a meeting to generate an AI intelligence report."
          />
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="card p-5 hover:border-fire-mid/30 cursor-pointer" onClick={() => navigate(`/report/${m.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl">{m.title}</h3>
                      {m.has_analysis ? (
                        <span className="badge badge-success text-xs">AI Ready</span>
                      ) : (
                        <span className="badge text-xs bg-bg-surface text-text-dim border border-bg-border">No Analysis</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDateTime(m.ended_at || m.created_at)}</span>
                      {m.duration_seconds && <span className="flex items-center gap-1"><FileText size={11} />{formatDuration(m.duration_seconds)}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {m.participants?.map((p, i) => (
                        <Badge key={i} variant={p.role === "distributor" ? "distributor" : "vendor"}>{p.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <BarChart2 size={20} className="text-text-dim group-hover:text-fire-mid flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
