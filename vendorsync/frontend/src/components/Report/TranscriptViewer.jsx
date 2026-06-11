import React, { useState } from "react";
import { Search } from "lucide-react";
import { formatTimestamp } from "../../utils/formatTime";

export function TranscriptViewer({ segments }) {
  const [query, setQuery] = useState("");

  const filtered = segments.filter(
    (s) =>
      !query ||
      s.text?.toLowerCase().includes(query.toLowerCase()) ||
      s.speaker_name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="sticky top-0 bg-bg-void py-2 z-10">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by speaker or keyword..."
            className="input-fire pl-9 text-sm"
          />
        </div>
        {query && (
          <p className="text-xs text-text-dim mt-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Segments */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-text-dim text-sm text-center py-8">No transcript segments found.</p>
        ) : (
          filtered.map((seg) => (
            <div
              key={seg.id}
              className={`rounded p-4 ${
                seg.speaker_role === "distributor" ? "segment-distributor" : "segment-vendor"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-text-dim">
                  [{formatTimestamp(seg.start_time || 0)}]
                </span>
                <span className="font-mono text-xs font-bold text-text-secondary uppercase">
                  {seg.speaker_name}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    seg.speaker_role === "distributor" ? "text-fire-core" : "text-fire-mid"
                  }`}
                >
                  • {seg.speaker_role}
                </span>
              </div>
              <p className="font-mono text-sm text-text-primary leading-relaxed">
                {seg.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
