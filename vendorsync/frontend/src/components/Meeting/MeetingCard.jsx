import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Calendar, ArrowRight, BarChart2 } from "lucide-react";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { formatDateTime, formatDuration, timeAgo } from "../../utils/formatTime";

export function MeetingCard({ meeting }) {
  const navigate = useNavigate();
  const isActive = meeting.status === "active";
  const isCompleted = meeting.status === "completed";

  return (
    <div className={`card p-5 ${isActive ? "card-active animate-breathe" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs text-fire-core font-semibold">
                <span className="w-2 h-2 rounded-full bg-fire-core animate-rec-dot" />
                LIVE
              </span>
            )}
            <h3 className="font-display text-xl text-text-primary truncate">
              {meeting.title}
            </h3>
          </div>

          {meeting.description && (
            <p className="text-sm text-text-dim mb-3 truncate">{meeting.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDateTime(meeting.scheduled_at || meeting.created_at)}
            </span>
            {meeting.duration_seconds && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(meeting.duration_seconds)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} />
              {meeting.participants?.length || 0} participants
            </span>
          </div>

          {/* Participant badges */}
          {meeting.participants?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {meeting.participants.slice(0, 4).map((p, i) => (
                <Badge key={i} variant={p.role === "distributor" ? "distributor" : "vendor"}>
                  {p.name}
                </Badge>
              ))}
              {meeting.participants.length > 4 && (
                <Badge>+{meeting.participants.length - 4}</Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {isActive && (
            <Button
              size="sm"
              onClick={() => navigate(`/meeting/${meeting.id}`)}
              icon={<ArrowRight size={14} />}
            >
              Join
            </Button>
          )}
          {isCompleted && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/report/${meeting.id}`)}
              icon={<BarChart2 size={14} />}
            >
              Report
            </Button>
          )}
          {meeting.status === "scheduled" && (
            <Button
              size="sm"
              onClick={() => navigate(`/meeting/${meeting.id}`)}
            >
              Start
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
