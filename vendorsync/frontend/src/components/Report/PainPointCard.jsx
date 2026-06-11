import React from "react";
import { AlertTriangle, Lightbulb, Tag } from "lucide-react";
import { SEVERITY_COLORS } from "../../utils/constants";

export function PainPointCard({ painPoint }) {
  const severityClass = SEVERITY_COLORS[painPoint.severity] || "severity-low";

  return (
    <div className="card p-5 hover:border-fire-mid/30 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">{painPoint.title}</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{painPoint.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`badge ${severityClass}`}>
          {painPoint.severity?.toUpperCase()}
        </span>
        <span className="badge bg-bg-surface text-text-secondary border border-bg-border">
          <Tag size={10} className="mr-1" />
          {painPoint.category}
        </span>
        <span
          className={`badge ${
            painPoint.raised_by === "distributor"
              ? "badge-distributor"
              : painPoint.raised_by === "vendor"
              ? "badge-vendor"
              : "bg-bg-surface text-text-secondary border border-bg-border"
          }`}
        >
          raised by {painPoint.raised_by}
        </span>
      </div>

      {painPoint.suggested_solution && (
        <div
          className="rounded p-3 flex gap-3"
          style={{
            background: "rgba(0,255,135,0.05)",
            border: "1px solid rgba(0,255,135,0.2)",
          }}
        >
          <Lightbulb size={16} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-success mb-1">SUGGESTED SOLUTION</p>
            <p className="text-sm text-text-secondary">{painPoint.suggested_solution}</p>
          </div>
        </div>
      )}
    </div>
  );
}
