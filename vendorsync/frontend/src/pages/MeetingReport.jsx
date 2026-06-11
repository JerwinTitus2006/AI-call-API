import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Users, Clock, Calendar,
  CheckCircle, AlertTriangle, FileText, Video, Zap, BarChart2
} from "lucide-react";
import { Badge } from "../components/UI/Badge";
import { Loader } from "../components/UI/Loader";
import { PainPointCard } from "../components/Report/PainPointCard";
import { TranscriptViewer } from "../components/Report/TranscriptViewer";
import { meetingService } from "../services/meetingService";
import { formatDateTime, formatDuration } from "../utils/formatTime";
import { SENTIMENT_COLORS, PRIORITY_COLORS } from "../utils/constants";
import toast from "react-hot-toast";

const TABS = [
  { id: "summary", label: "Summary", icon: <Zap size={14} /> },
  { id: "painpoints", label: "Pain Points", icon: <AlertTriangle size={14} /> },
  { id: "actions", label: "Action Items", icon: <CheckCircle size={14} /> },
  { id: "transcript", label: "Full Transcript", icon: <FileText size={14} /> },
  { id: "recording", label: "Recording", icon: <Video size={14} /> },
];

function EffectivenessRing({ score }) {
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 10) * circumference;

  return (
    <div className="ring-container flex flex-col items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1F1F1F" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={score >= 7 ? "#00FF87" : score >= 4 ? "#FF8C00" : "#FF2200"}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl" style={{ color: score >= 7 ? "#00FF87" : "#FF8C00" }}>
          {score}
        </span>
        <span className="text-xs text-text-dim">/10</span>
      </div>
    </div>
  );
}

export default function MeetingReport() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [meeting, setMeeting] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});

  useEffect(() => {
    fetchAll();
  }, [meetingId]);

  const fetchAll = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        meetingService.get(meetingId),
        meetingService.getTranscript(meetingId).catch(() => null),
      ]);
      setMeeting(mRes.data);
      setTranscript(tRes?.data);

      if (mRes.data.has_analysis) {
        try {
          const aRes = await meetingService.getAnalysis(meetingId);
          setAnalysis(aRes.data);
        } catch (_) {}
      }
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setGenerating(true);
    try {
      const res = await meetingService.generateAnalysis(meetingId);
      setAnalysis(res.data);
      toast.success("AI analysis generated! 🔥");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Analysis generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  const toggleAction = (id) => {
    setCheckedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <Loader text="Loading report..." />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center text-center">
        <div>
          <p className="font-display text-3xl text-fire-core mb-4">REPORT NOT FOUND</p>
          <button onClick={() => navigate("/dashboard")} className="btn-fire">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const fileUrl = meeting.video_file_id
    ? meetingService.getFileUrl(meeting.video_file_id)
    : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";


  return (
    <div className="min-h-screen bg-bg-void">
      {/* Header */}
      <div className="bg-bg-dark border-b border-bg-border px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="font-display text-5xl glow-text mb-2">{meeting.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDateTime(meeting.created_at)}
                </span>
                {meeting.duration_seconds && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatDuration(meeting.duration_seconds)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {meeting.participants?.length || 0} participants
                </span>
              </div>

              {/* Participants */}
              <div className="flex flex-wrap gap-2 mt-3">
                {meeting.participants?.map((p, i) => (
                  <Badge key={i} variant={p.role === "distributor" ? "distributor" : "vendor"}>
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {analysis && (
                <div className="relative flex items-center justify-center">
                  <EffectivenessRing score={analysis.meeting_effectiveness_score || 0} />
                </div>
              )}
              {analysis && (
                <button
                  onClick={generateAnalysis}
                  disabled={generating}
                  className="btn-ghost flex items-center gap-2 text-sm border border-fire-mid/30 hover:border-fire-mid text-fire-mid hover:text-fire-core transition-all"
                >
                  {generating ? "Re-generating..." : "Re-generate AI"}
                </button>
              )}
              <button onClick={handlePrint} className="btn-ghost flex items-center gap-2 text-sm">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bg-dark border-b border-bg-border px-8">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn flex items-center gap-1.5 ${activeTab === t.id ? "active" : ""}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8 animate-fade-in">
        {/* No analysis state */}
        {!analysis && activeTab !== "transcript" && activeTab !== "recording" && (
          <div className="card p-8 text-center mb-8">
            <BarChart2 size={40} className="text-text-dim mx-auto mb-4" />
            <h3 className="font-display text-2xl text-text-secondary mb-2">NO AI ANALYSIS YET</h3>
            <p className="text-text-dim text-sm mb-6">
              {transcript?.full_text
                ? "Transcript available. Generate AI analysis now."
                : "No transcript available for analysis. Record a meeting first."}
            </p>
            {transcript?.full_text && (
              <button
                onClick={generateAnalysis}
                disabled={generating}
                className="btn-fire glow-fire"
              >
                {generating ? "Generating..." : "Generate AI Analysis"}
              </button>
            )}
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === "summary" && analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary + Sentiment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-6">
                <h2 className="font-display text-xl text-text-secondary mb-3">MEETING SUMMARY</h2>
                <p className="text-text-primary leading-relaxed">{analysis.summary}</p>
              </div>
              <div className="card p-6">
                <h2 className="font-display text-xl text-text-secondary mb-4">SENTIMENT</h2>
                <div className="space-y-3">
                  {[
                    { label: "Overall", value: analysis.overall_sentiment },
                    { label: "Distributor", value: analysis.distributor_sentiment },
                    { label: "Vendor", value: analysis.vendor_sentiment },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{label}</span>
                      <span className={`text-sm font-semibold capitalize ${SENTIMENT_COLORS[value] || "text-text-secondary"}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics */}
            {analysis.topics_discussed?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display text-xl text-text-secondary mb-4">TOPICS DISCUSSED</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics_discussed.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-sm"
                      style={{
                        background: "rgba(255,85,0,0.1)",
                        border: "1px solid rgba(255,85,0,0.3)",
                        color: "#FF5500",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            {analysis.key_points?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display text-xl text-text-secondary mb-4">KEY POINTS</h2>
                <ul className="space-y-2">
                  {analysis.key_points.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-fire-core mt-2 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Decisions & Agreements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysis.decisions_made?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display text-xl text-text-secondary mb-4">DECISIONS MADE</h2>
                  <ol className="space-y-2">
                    {analysis.decisions_made.map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
                        <span className="font-display text-fire-core text-lg leading-none mt-0.5">{i + 1}</span>
                        {d}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {analysis.agreements?.length > 0 && (
                <div className="card p-6" style={{ borderColor: "rgba(0,255,135,0.2)" }}>
                  <h2 className="font-display text-xl text-success mb-4">AGREEMENTS</h2>
                  <ul className="space-y-2">
                    {analysis.agreements.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
                        <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAIN POINTS TAB */}
        {activeTab === "painpoints" && analysis && (
          <div className="animate-fade-in">
            {analysis.pain_points?.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
                <p className="font-display text-2xl text-success">NO PAIN POINTS IDENTIFIED</p>
                <p className="text-text-secondary text-sm mt-2">Great meeting! No friction detected.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  {analysis.pain_points.length} pain point{analysis.pain_points.length !== 1 ? "s" : ""} identified
                </p>
                {analysis.pain_points.map((pp) => (
                  <PainPointCard key={pp.id} painPoint={pp} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {activeTab === "actions" && analysis && (
          <div className="animate-fade-in">
            {analysis.action_items?.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl text-text-secondary">NO ACTION ITEMS</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-bg-border">
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Done</th>
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Task</th>
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Owner</th>
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Priority</th>
                      <th className="text-left px-4 py-3 text-xs text-text-dim uppercase tracking-wider">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.action_items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-bg-border last:border-0 transition-colors ${
                          checkedActions[item.id] ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={!!checkedActions[item.id]}
                            onChange={() => toggleAction(item.id)}
                            className="accent-fire-core w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary max-w-xs">
                          <span className={checkedActions[item.id] ? "line-through text-text-dim" : ""}>
                            {item.task}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{item.owner}</td>
                        <td className="px-4 py-3">
                          <Badge variant={item.owner_role === "distributor" ? "distributor" : "vendor"}>
                            {item.owner_role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold capitalize ${PRIORITY_COLORS[item.priority] || "text-text-secondary"}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-dim">
                          {item.deadline_mentioned || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === "transcript" && (
          <div className="animate-fade-in">
            {transcript?.segments?.length > 0 ? (
              <TranscriptViewer segments={transcript.segments} />
            ) : (
              <div className="text-center py-16">
                <FileText size={40} className="text-text-dim mx-auto mb-4" />
                <p className="font-display text-2xl text-text-secondary">NO TRANSCRIPT AVAILABLE</p>
                <p className="text-text-dim text-sm mt-2">Transcript is created when participants speak during the meeting.</p>
              </div>
            )}
          </div>
        )}

        {/* RECORDING TAB */}
        {activeTab === "recording" && (
          <div className="animate-fade-in">
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-text-secondary">MEETING RECORDING</h2>
                  {!meeting.video_file_id && (
                    <span className="text-xs text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded">
                      Sample Recording
                    </span>
                  )}
                </div>
                <video
                  src={fileUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ background: "#0a0a0a", maxHeight: "480px" }}
                />
                <div className="flex gap-3">
                  <a
                    href={fileUrl}
                    download={`recording-${meetingId}.webm`}
                    className="btn-ghost flex items-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    Download Recording
                  </a>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
